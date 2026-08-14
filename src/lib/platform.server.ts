// Server-only helpers: workbook/template parsing, reachability probing, HTML report building.
import { strFromU8, unzipSync } from "fflate";
import * as XLSX from "xlsx";

import type {
  TemplateGraphSlot,
  TemplatePlaceholder,
  ProbeResult,
} from "./platform-types";

export async function db() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export function decodeBase64(base64: string): Uint8Array {
  const clean = base64.includes(",") ? base64.slice(base64.indexOf(",") + 1) : base64;
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes as unknown as ArrayBuffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ------------------------------- Excel import ------------------------------ */

const COLUMN_ALIASES: Record<string, string[]> = {
  customer: ["customer", "client", "account", "customer name"],
  link_name: ["link", "link name", "major link", "network", "link description", "site", "description"],
  circuit_id: ["circuit", "circuit id", "circuit reference", "service id"],
  bandwidth_mbps: ["bandwidth", "capacity", "bandwidth (mbps)", "speed", "mbps"],
  region: ["region", "area", "zone"],
  device: ["device", "hostname", "node", "router", "equipment"],
  interface_name: ["interface", "port", "ifname", "interface name"],
  observium_ref: ["observium", "observium link", "observium url", "observium graph"],
  solarwinds_ref: ["solarwinds", "solar winds", "solarwinds link", "solarwinds url", "npm"],
};

function normalise(header: string) {
  return header.toString().trim().toLowerCase().replace(/[_\s]+/g, " ");
}

function matchColumn(header: string): string | null {
  const h = normalise(header);
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (aliases.some((a) => h === a)) return field;
  }
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (aliases.some((a) => h.includes(a))) return field;
  }
  return null;
}

export type ParsedWorkbook = {
  sheetNames: string[];
  detectedColumns: string[];
  mapping: Record<string, string>;
  links: Array<Record<string, unknown>>;
  invalid: number;
  duplicates: number;
};

export function parseWorkbook(bytes: Uint8Array): ParsedWorkbook {
  const wb = XLSX.read(bytes, { type: "array" });
  const sheetNames = wb.SheetNames;
  const detected = new Set<string>();
  const mapping: Record<string, string> = {};
  const links: Array<Record<string, unknown>> = [];
  const seen = new Set<string>();
  let invalid = 0;
  let duplicates = 0;

  for (const sheetName of sheetNames) {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) continue;
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    for (const row of rows) {
      const mapped: Record<string, unknown> = {};
      for (const [header, value] of Object.entries(row)) {
        detected.add(header.toString().trim());
        const field = matchColumn(header);
        if (!field) continue;
        mapping[field] = header.toString().trim();
        const text = value === null || value === undefined ? "" : value.toString().trim();
        if (!text) continue;
        if (field === "bandwidth_mbps") {
          const digits = Number.parseInt(text.replace(/[^0-9.]/g, ""), 10);
          if (!Number.isNaN(digits)) {
            mapped[field] = /g(bps)?\b/i.test(text) ? digits * 1000 : digits;
          }
        } else {
          mapped[field] = text;
        }
      }

      const linkName = (mapped["link_name"] as string | undefined)?.trim();
      if (!linkName) {
        if (Object.keys(mapped).length > 0) invalid += 1;
        continue;
      }
      const key = `${(mapped["customer"] as string) ?? ""}|${linkName}`.toLowerCase();
      if (seen.has(key)) {
        duplicates += 1;
        continue;
      }
      seen.add(key);
      links.push({ ...mapped, raw: { sheet: sheetName, ...row } });
    }
  }

  return {
    sheetNames,
    detectedColumns: Array.from(detected),
    mapping,
    links,
    invalid,
    duplicates,
  };
}

/* ------------------------------ Word template ----------------------------- */

export type ParsedTemplate = {
  placeholders: TemplatePlaceholder[];
  graphSlots: TemplateGraphSlot[];
  bodyText: string;
  imageCount: number;
};

function classify(token: string): TemplatePlaceholder["kind"] {
  const t = token.toLowerCase();
  if (/(graph|chart|image|screenshot)/.test(t)) return "graph";
  if (/(table|rows)/.test(t)) return "table";
  if (/(date|month|period|day)/.test(t)) return "date";
  return "text";
}

export function parseTemplate(bytes: Uint8Array): ParsedTemplate {
  const files = unzipSync(bytes);
  const documentXml = files["word/document.xml"];
  if (!documentXml) {
    throw new Error("This file is not a readable Word (.docx) document.");
  }
  const xml = strFromU8(documentXml);
  const paragraphs = xml
    .split(/<\/w:p>/)
    .map((p) => (p.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) ?? []).map((t) => t.replace(/<[^>]+>/g, "")).join(""))
    .filter((line) => line.trim().length > 0);
  const bodyText = paragraphs.join("\n");

  const tokens = new Set<string>();
  for (const match of bodyText.matchAll(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g)) {
    if (match[1]) tokens.add(match[1]);
  }
  // Also support <graph_name> / [GRAPH: name] style markers.
  for (const match of bodyText.matchAll(/\[\s*graph\s*:\s*([^\]]+)\]/gi)) {
    if (match[1]) tokens.add(`graph_${match[1].trim().toLowerCase().replace(/\s+/g, "_")}`);
  }

  const imageCount = Object.keys(files).filter((name) => /^word\/media\//.test(name)).length;

  const placeholders: TemplatePlaceholder[] = Array.from(tokens).map((token) => ({
    token,
    kind: classify(token),
  }));

  let graphSlots: TemplateGraphSlot[] = placeholders
    .filter((p) => p.kind === "graph")
    .map((p, index) => ({
      key: p.token,
      label: p.token.replace(/[_-]+/g, " ").replace(/\bgraph\b/i, "graph").trim(),
      platform: /observium|latenc|availab|uptime/i.test(p.token) || index % 2 === 1 ? "Observium" : "SolarWinds",
    }));

  if (graphSlots.length === 0 && imageCount > 0) {
    graphSlots = Array.from({ length: imageCount }, (_, i) => ({
      key: `graph_slot_${i + 1}`,
      label: `Graph slot ${i + 1}`,
      platform: i % 2 === 0 ? "SolarWinds" : "Observium",
    }));
  }

  return { placeholders, graphSlots, bodyText, imageCount };
}

/* ------------------------------ Reachability ------------------------------ */

export async function probeUrl(url: string, timeoutMs = 10000): Promise<ProbeResult> {
  const started = Date.now();
  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return { ok: false, status: "disconnected", message: `"${url}" is not a valid URL.`, httpStatus: null, latencyMs: 0 };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(target.toString(), {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "MTL-ANPMRS/1.0 reachability-probe" },
    });
    const latencyMs = Date.now() - started;
    if (response.status >= 500) {
      return {
        ok: false,
        status: "degraded",
        message: `Reached ${target.host} but it returned HTTP ${response.status}.`,
        httpStatus: response.status,
        latencyMs,
      };
    }
    return {
      ok: true,
      status: "connected",
      message: `${target.host} responded with HTTP ${response.status} in ${latencyMs} ms.`,
      httpStatus: response.status,
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - started;
    const reason = error instanceof Error ? error.message : String(error);
    const aborted = /abort/i.test(reason);
    return {
      ok: false,
      status: "disconnected",
      message: aborted
        ? `No response from ${target.host} within ${timeoutMs / 1000}s — the host is not reachable from this server (internal MTL hosts need the on-premise capture worker).`
        : `Could not reach ${target.host}: ${reason}`,
      httpStatus: null,
      latencyMs,
    };
  }
}

/* ---------------------------- Report HTML build --------------------------- */

export function buildReportHtml(input: {
  title: string;
  periodLabel: string;
  bodyText: string | null;
  placeholders: TemplatePlaceholder[];
  links: Array<{ link_name: string; customer: string | null; region: string | null; bandwidth_mbps: number | null; circuit_id: string | null }>;
  captures: Array<{ slot_label: string | null; slot_key: string; platform: string; status: string; preview_url?: string | null; error_message: string | null; captured_at: string | null; source_url: string | null; checksum: string | null }>;
  generatedBy: string;
}): string {
  const esc = (value: unknown) =>
    String(value ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);

  const linkRows = input.links
    .map(
      (l) => `<tr><td>${esc(l.link_name)}</td><td>${esc(l.customer ?? "—")}</td><td>${esc(l.region ?? "—")}</td><td>${
        l.bandwidth_mbps ? `${l.bandwidth_mbps} Mbps` : "—"
      }</td><td>${esc(l.circuit_id ?? "—")}</td></tr>`,
    )
    .join("");

  const graphBlocks = input.captures
    .map((c) => {
      const body =
        c.status === "captured" && c.preview_url
          ? `<img src="${esc(c.preview_url)}" alt="${esc(c.slot_label ?? c.slot_key)}" />`
          : `<p class="missing">Graph not captured — ${esc(c.error_message ?? "pending")}</p>`;
      return `<section class="graph"><h3>${esc(c.slot_label ?? c.slot_key)}</h3>${body}
        <p class="meta">Source: ${esc(c.platform)} · ${esc(c.source_url ?? "n/a")} · ${esc(c.captured_at ?? "not captured")}${
          c.checksum ? ` · sha256 ${esc(c.checksum.slice(0, 12))}…` : ""
        }</p></section>`;
    })
    .join("");

  const narrative = (input.bodyText ?? "")
    .split("\n")
    .map((line) =>
      line.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_m, token: string) => {
        const t = token.toLowerCase();
        if (/(date|period|month)/.test(t)) return input.periodLabel;
        if (/(graph|chart|image|screenshot)/.test(t)) return "[graph inserted below]";
        if (/(table|rows)/.test(t)) return `${input.links.length} links tabulated below`;
        return `<span class="token">${token}</span>`;
      }),
    )
    .filter((line) => line.trim().length > 0)
    .map((line) => `<p>${line}</p>`)
    .join("");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8" />
<title>${esc(input.title)}</title>
<style>
  body{font-family:"Helvetica Neue",Arial,sans-serif;color:#141428;margin:0;padding:40px;max-width:900px}
  header{border-bottom:6px solid #1E1E8C;padding-bottom:16px;margin-bottom:24px}
  h1{color:#1E1E8C;margin:0 0 6px;font-size:26px}
  .sub{color:#555;font-size:13px}
  h2{color:#1E1E8C;font-size:17px;margin-top:32px;border-left:5px solid #FFE600;padding-left:10px}
  table{border-collapse:collapse;width:100%;font-size:12px;margin-top:12px}
  th{background:#1E1E8C;color:#fff;text-align:left;padding:8px}
  td{border-bottom:1px solid #e3e3ef;padding:7px}
  .graph{margin-top:20px;padding:14px;border:1px solid #e3e3ef;border-radius:8px}
  .graph h3{margin:0 0 8px;font-size:14px}
  .graph img{max-width:100%;border:1px solid #ddd}
  .meta{font-size:11px;color:#666;margin:8px 0 0;font-family:monospace}
  .missing{background:#fdecec;color:#a11;padding:10px;border-radius:6px;font-size:12px;margin:0}
  .token{background:#FFE600;padding:0 4px;border-radius:3px}
  footer{margin-top:40px;border-top:1px solid #ddd;padding-top:12px;font-size:11px;color:#666}
</style></head><body>
<header><h1>${esc(input.title)}</h1>
<p class="sub">Malawi Telecommunications Limited · Reporting period ${esc(input.periodLabel)} · Prepared by ${esc(
    input.generatedBy,
  )}</p></header>
<h2>Report narrative (from template)</h2>
${narrative || "<p>No narrative text found in the uploaded template.</p>"}
<h2>Major links in scope</h2>
<table><thead><tr><th>Link</th><th>Customer</th><th>Region</th><th>Bandwidth</th><th>Circuit</th></tr></thead>
<tbody>${linkRows || '<tr><td colspan="5">No infrastructure workbook imported yet.</td></tr>'}</tbody></table>
<h2>Captured graphs</h2>
${graphBlocks || "<p>This template declares no graph slots.</p>"}
<footer>Generated by MTL ANPMRS · every graph above carries its source platform, URL, capture time and checksum for verification.</footer>
</body></html>`;
}