import { createServerFn } from "@tanstack/react-start";

import type {
  AppUserRow,
  CaptureRow,
  GenerateResult,
  InfraFileRow,
  InfraLinkRow,
  IntegrationRow,
  LogRow,
  ProbeResult,
  ReportRow,
  TemplateRow,
} from "./platform-types";
import {
  buildReportHtml,
  db,
  decodeBase64,
  parseTemplate,
  parseWorkbook,
  probeUrl,
  sha256Hex,
} from "./platform.server";

/* -------------------------------- activity -------------------------------- */

export const recordActivity = createServerFn({ method: "POST" })
  .inputValidator((input: { actor: string; action: string; resource?: string; result?: string }) => input)
  .handler(async ({ data }) => {
    const supabase = await db();
    await supabase.from("activity_logs").insert({
      actor: data.actor,
      action: data.action,
      resource: data.resource ?? null,
      result: data.result ?? "success",
    });
    if (data.action === "user.login") {
      await supabase.from("app_users").update({ last_login_at: new Date().toISOString() }).eq("email", data.actor);
    }
    return { ok: true };
  });

export const listLogs = createServerFn({ method: "GET" }).handler(async (): Promise<LogRow[]> => {
  const supabase = await db();
  const { data } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(200);
  return (data ?? []) as LogRow[];
});

/* ------------------------------ integrations ------------------------------ */

export const listIntegrations = createServerFn({ method: "GET" }).handler(async (): Promise<IntegrationRow[]> => {
  const supabase = await db();
  const { data } = await supabase.from("integrations").select("*").order("created_at");
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    kind: row.kind,
    base_url: row.base_url,
    detail: row.detail,
    status: row.status,
    owner_email: row.owner_email,
    login_username: row.login_username,
    has_password: Boolean(row.login_password),
    last_checked_at: row.last_checked_at,
    last_used_at: row.last_used_at,
  }));
});

export const saveIntegration = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      id?: string;
      name: string;
      kind: string;
      base_url: string;
      owner_email?: string;
      login_username?: string;
      login_password?: string;
      actor: string;
    }) => input,
  )
  .handler(async ({ data }): Promise<IntegrationRow> => {
    const supabase = await db();
    const patch: Record<string, unknown> = {
      name: data.name.trim(),
      kind: data.kind.trim(),
      base_url: data.base_url.trim(),
      owner_email: data.owner_email?.trim() || null,
      login_username: data.login_username?.trim() || null,
      updated_at: new Date().toISOString(),
    };
    if (data.login_password && data.login_password.length > 0) patch["login_password"] = data.login_password;

    const saved = data.id
      ? await supabase.from("integrations").update(patch as never).eq("id", data.id).select("*").single()
      : await supabase.from("integrations").insert(patch as never).select("*").single();

    if (saved.error || !saved.data) throw new Error(saved.error?.message ?? "Could not save the connection.");

    await supabase.from("activity_logs").insert({
      actor: data.actor,
      action: data.id ? "integration.updated" : "integration.created",
      resource: saved.data.name,
    });

    const row = saved.data;
    return {
      id: row.id,
      name: row.name,
      kind: row.kind,
      base_url: row.base_url,
      detail: row.detail,
      status: row.status,
      owner_email: row.owner_email,
      login_username: row.login_username,
      has_password: Boolean(row.login_password),
      last_checked_at: row.last_checked_at,
      last_used_at: row.last_used_at,
    };
  });

export const testIntegration = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; actor: string }) => input)
  .handler(async ({ data }): Promise<ProbeResult> => {
    const supabase = await db();
    const { data: row } = await supabase.from("integrations").select("*").eq("id", data.id).single();
    if (!row) throw new Error("Connection not found.");

    const result = await probeUrl(row.base_url);
    await supabase
      .from("integrations")
      .update({ status: result.status, last_checked_at: new Date().toISOString() })
      .eq("id", data.id);
    await supabase.from("activity_logs").insert({
      actor: data.actor,
      action: "integration.tested",
      resource: row.name,
      result: result.ok ? "success" : "failure",
    });
    return result;
  });

export const deleteIntegration = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; actor: string }) => input)
  .handler(async ({ data }) => {
    const supabase = await db();
    const { data: row } = await supabase.from("integrations").select("name").eq("id", data.id).single();
    await supabase.from("integrations").delete().eq("id", data.id);
    await supabase
      .from("activity_logs")
      .insert({ actor: data.actor, action: "integration.deleted", resource: row?.name ?? data.id });
    return { ok: true };
  });

/* --------------------------- infrastructure files -------------------------- */

export const listInfraFiles = createServerFn({ method: "GET" }).handler(async (): Promise<InfraFileRow[]> => {
  const supabase = await db();
  const { data } = await supabase
    .from("infrastructure_files")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({
    id: row.id,
    filename: row.filename,
    size_bytes: Number(row.size_bytes),
    uploaded_by: row.uploaded_by,
    status: row.status,
    sheet_names: (row.sheet_names as string[]) ?? [],
    detected_columns: (row.detected_columns as string[]) ?? [],
    summary: (row.summary as Record<string, number>) ?? {},
    error_message: row.error_message,
    created_at: row.created_at,
  }));
});

export const listInfraLinks = createServerFn({ method: "POST" })
  .inputValidator((input: { fileId?: string }) => input)
  .handler(async ({ data }): Promise<InfraLinkRow[]> => {
    const supabase = await db();
    let fileId = data.fileId;
    if (!fileId) {
      const { data: latest } = await supabase
        .from("infrastructure_files")
        .select("id")
        .eq("status", "imported")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      fileId = latest?.id;
    }
    if (!fileId) return [];
    const { data: rows } = await supabase
      .from("infrastructure_links")
      .select("id, customer, link_name, circuit_id, bandwidth_mbps, region, device, interface_name, observium_ref, solarwinds_ref")
      .eq("file_id", fileId)
      .order("link_name");
    return (rows ?? []) as InfraLinkRow[];
  });

export const uploadInfraFile = createServerFn({ method: "POST" })
  .inputValidator((input: { filename: string; base64: string; actor: string }) => input)
  .handler(async ({ data }): Promise<InfraFileRow> => {
    const supabase = await db();
    const bytes = decodeBase64(data.base64);
    const storagePath = `${Date.now()}-${data.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    await supabase.storage.from("infrastructure").upload(storagePath, bytes, {
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      upsert: true,
    });

    let parsed;
    try {
      parsed = parseWorkbook(bytes);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unreadable workbook.";
      const { data: bad } = await supabase
        .from("infrastructure_files")
        .insert({
          filename: data.filename,
          storage_path: storagePath,
          size_bytes: bytes.length,
          uploaded_by: data.actor,
          status: "invalid",
          error_message: message,
        })
        .select("*")
        .single();
      await supabase.from("activity_logs").insert({
        actor: data.actor,
        action: "infrastructure.uploaded",
        resource: data.filename,
        result: "failure",
      });
      throw new Error(`${message} (file kept as invalid: ${bad?.id ?? "unknown"})`);
    }

    const customers = new Set(parsed.links.map((l) => (l["customer"] as string) ?? "").filter(Boolean));
    const devices = new Set(parsed.links.map((l) => (l["device"] as string) ?? "").filter(Boolean));
    const withObservium = parsed.links.filter((l) => l["observium_ref"]).length;
    const withSolarwinds = parsed.links.filter((l) => l["solarwinds_ref"]).length;

    const { data: fileRow, error } = await supabase
      .from("infrastructure_files")
      .insert({
        filename: data.filename,
        storage_path: storagePath,
        size_bytes: bytes.length,
        uploaded_by: data.actor,
        status: parsed.links.length > 0 ? "imported" : "invalid",
        sheet_names: parsed.sheetNames,
        detected_columns: parsed.detectedColumns,
        summary: {
          links: parsed.links.length,
          customers: customers.size,
          devices: devices.size,
          observium_mapped: withObservium,
          solarwinds_mapped: withSolarwinds,
          invalid: parsed.invalid,
          duplicates: parsed.duplicates,
        },
        error_message: parsed.links.length === 0 ? "No major links could be read from this workbook." : null,
      })
      .select("*")
      .single();

    if (error || !fileRow) throw new Error(error?.message ?? "Could not save the workbook.");

    if (parsed.links.length > 0) {
      const chunkSize = 500;
      for (let i = 0; i < parsed.links.length; i += chunkSize) {
        const chunk = parsed.links.slice(i, i + chunkSize).map((l) => ({
          file_id: fileRow.id,
          customer: (l["customer"] as string) ?? null,
          link_name: l["link_name"] as string,
          circuit_id: (l["circuit_id"] as string) ?? null,
          bandwidth_mbps: (l["bandwidth_mbps"] as number) ?? null,
          region: (l["region"] as string) ?? null,
          device: (l["device"] as string) ?? null,
          interface_name: (l["interface_name"] as string) ?? null,
          observium_ref: (l["observium_ref"] as string) ?? null,
          solarwinds_ref: (l["solarwinds_ref"] as string) ?? null,
          raw: l["raw"] ?? {},
        }));
        await supabase.from("infrastructure_links").insert(chunk as never);
      }
    }

    await supabase.from("activity_logs").insert({
      actor: data.actor,
      action: "infrastructure.uploaded",
      resource: data.filename,
    });

    return {
      id: fileRow.id,
      filename: fileRow.filename,
      size_bytes: Number(fileRow.size_bytes),
      uploaded_by: fileRow.uploaded_by,
      status: fileRow.status,
      sheet_names: (fileRow.sheet_names as string[]) ?? [],
      detected_columns: (fileRow.detected_columns as string[]) ?? [],
      summary: (fileRow.summary as Record<string, number>) ?? {},
      error_message: fileRow.error_message,
      created_at: fileRow.created_at,
    };
  });

export const deleteInfraFile = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; actor: string }) => input)
  .handler(async ({ data }) => {
    const supabase = await db();
    const { data: row } = await supabase.from("infrastructure_files").select("filename").eq("id", data.id).single();
    await supabase.from("infrastructure_files").delete().eq("id", data.id);
    await supabase
      .from("activity_logs")
      .insert({ actor: data.actor, action: "infrastructure.deleted", resource: row?.filename ?? data.id });
    return { ok: true };
  });

/* -------------------------------- templates ------------------------------- */

export const listTemplates = createServerFn({ method: "GET" }).handler(async (): Promise<TemplateRow[]> => {
  const supabase = await db();
  const { data } = await supabase.from("report_templates").select("*").order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({
    id: row.id,
    label: row.label,
    filename: row.filename,
    size_bytes: Number(row.size_bytes),
    uploaded_by: row.uploaded_by,
    is_active: row.is_active,
    placeholders: (row.placeholders as TemplateRow["placeholders"]) ?? [],
    graph_slots: (row.graph_slots as TemplateRow["graph_slots"]) ?? [],
    created_at: row.created_at,
  }));
});

export const uploadTemplate = createServerFn({ method: "POST" })
  .inputValidator((input: { filename: string; label?: string; base64: string; actor: string }) => input)
  .handler(async ({ data }): Promise<TemplateRow> => {
    const supabase = await db();
    const bytes = decodeBase64(data.base64);
    const parsed = parseTemplate(bytes);
    const storagePath = `${Date.now()}-${data.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    await supabase.storage.from("templates").upload(storagePath, bytes, {
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      upsert: true,
    });

    const { count } = await supabase.from("report_templates").select("id", { count: "exact", head: true });

    const { data: row, error } = await supabase
      .from("report_templates")
      .insert({
        label: data.label?.trim() || data.filename.replace(/\.docx?$/i, "").replace(/[_-]+/g, " "),
        filename: data.filename,
        storage_path: storagePath,
        size_bytes: bytes.length,
        uploaded_by: data.actor,
        is_active: (count ?? 0) === 0,
        placeholders: parsed.placeholders,
        graph_slots: parsed.graphSlots,
        body_text: parsed.bodyText.slice(0, 200000),
      })
      .select("*")
      .single();

    if (error || !row) throw new Error(error?.message ?? "Could not save the template.");

    await supabase
      .from("activity_logs")
      .insert({ actor: data.actor, action: "template.uploaded", resource: data.filename });

    return {
      id: row.id,
      label: row.label,
      filename: row.filename,
      size_bytes: Number(row.size_bytes),
      uploaded_by: row.uploaded_by,
      is_active: row.is_active,
      placeholders: (row.placeholders as TemplateRow["placeholders"]) ?? [],
      graph_slots: (row.graph_slots as TemplateRow["graph_slots"]) ?? [],
      created_at: row.created_at,
    };
  });

export const activateTemplate = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; actor: string }) => input)
  .handler(async ({ data }) => {
    const supabase = await db();
    await supabase.from("report_templates").update({ is_active: false }).neq("id", data.id);
    await supabase.from("report_templates").update({ is_active: true }).eq("id", data.id);
    await supabase
      .from("activity_logs")
      .insert({ actor: data.actor, action: "template.activated", resource: data.id });
    return { ok: true };
  });

export const deleteTemplate = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; actor: string }) => input)
  .handler(async ({ data }) => {
    const supabase = await db();
    const { data: row } = await supabase.from("report_templates").select("filename").eq("id", data.id).single();
    await supabase.from("report_templates").delete().eq("id", data.id);
    await supabase
      .from("activity_logs")
      .insert({ actor: data.actor, action: "template.deleted", resource: row?.filename ?? data.id });
    return { ok: true };
  });

/* --------------------------------- reports -------------------------------- */

export const listReports = createServerFn({ method: "GET" }).handler(async (): Promise<ReportRow[]> => {
  const supabase = await db();
  const { data } = await supabase
    .from("reports")
    .select("id, name, template_label, status, format, created_by, period_label, error_message, approved_at, created_at")
    .order("created_at", { ascending: false });
  return (data ?? []) as ReportRow[];
});

export const generateReport = createServerFn({ method: "POST" })
  .inputValidator((input: { templateId: string; periodLabel: string; actor: string }) => input)
  .handler(async ({ data }): Promise<GenerateResult> => {
    const supabase = await db();

    const { data: template } = await supabase.from("report_templates").select("*").eq("id", data.templateId).single();
    if (!template) throw new Error("Template not found — upload a Word template first.");

    const graphSlots = (template.graph_slots as TemplateRow["graph_slots"]) ?? [];
    const { data: integrations } = await supabase.from("integrations").select("*");
    const { data: latestFile } = await supabase
      .from("infrastructure_files")
      .select("id")
      .eq("status", "imported")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data: links } = latestFile
      ? await supabase
          .from("infrastructure_links")
          .select("link_name, customer, region, bandwidth_mbps, circuit_id, observium_ref, solarwinds_ref")
          .eq("file_id", latestFile.id)
          .order("link_name")
      : { data: [] as Array<Record<string, never>> };

    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        name: `${template.label} — ${data.periodLabel}`,
        template_id: template.id,
        template_label: template.label,
        status: "capturing",
        created_by: data.actor,
        period_label: data.periodLabel,
      })
      .select("*")
      .single();
    if (reportError || !report) throw new Error(reportError?.message ?? "Could not start the report.");

    // Probe every platform the template needs before capturing anything.
    const neededPlatforms = Array.from(new Set(graphSlots.map((s) => s.platform)));
    const platformState = new Map<string, { url: string; ok: boolean; message: string }>();
    const platformErrors: GenerateResult["platformErrors"] = [];

    for (const platform of neededPlatforms) {
      const integration = (integrations ?? []).find((i) =>
        i.name.toLowerCase().includes(platform.toLowerCase().slice(0, 7)),
      );
      if (!integration) {
        platformState.set(platform, { url: "", ok: false, message: `No ${platform} connection is configured.` });
        platformErrors.push({ platform, url: "", message: `No ${platform} connection is configured under Integrations.` });
        continue;
      }
      if (!integration.login_username || !integration.login_password) {
        platformState.set(platform, {
          url: integration.base_url,
          ok: false,
          message: `No sign-in credentials saved for ${integration.name}.`,
        });
        platformErrors.push({
          platform,
          url: integration.base_url,
          message: `No sign-in credentials saved for ${integration.name}. Add them under Integrations → Update connection.`,
        });
        continue;
      }
      const probe = await probeUrl(integration.base_url);
      await supabase
        .from("integrations")
        .update({
          status: probe.status,
          last_checked_at: new Date().toISOString(),
          last_used_at: new Date().toISOString(),
        })
        .eq("id", integration.id);
      platformState.set(platform, { url: integration.base_url, ok: probe.ok, message: probe.message });
      if (!probe.ok) platformErrors.push({ platform, url: integration.base_url, message: probe.message });
    }

    const captureRows: Array<Record<string, unknown>> = [];
    for (const slot of graphSlots) {
      const state = platformState.get(slot.platform);
      const linkRef = (links ?? []).find((l) =>
        slot.platform === "Observium" ? Boolean(l.observium_ref) : Boolean(l.solarwinds_ref),
      );
      const refValue = slot.platform === "Observium" ? linkRef?.observium_ref : linkRef?.solarwinds_ref;
      const sourceUrl =
        refValue && /^https?:\/\//i.test(String(refValue)) ? String(refValue) : (state?.url ?? null);

      if (!state || !state.ok) {
        captureRows.push({
          report_id: report.id,
          slot_key: slot.key,
          slot_label: slot.label,
          platform: slot.platform,
          source_url: sourceUrl,
          status: "failed",
          error_message: state?.message ?? `${slot.platform} is not available.`,
        });
        continue;
      }

      // Reachable: pull the graph asset and store it with a checksum for audit.
      try {
        const response = await fetch(sourceUrl ?? state.url, {
          headers: { "user-agent": "MTL-ANPMRS/1.0 graph-capture" },
        });
        const contentType = response.headers.get("content-type") ?? "";
        const buffer = new Uint8Array(await response.arrayBuffer());
        if (!contentType.startsWith("image/")) {
          captureRows.push({
            report_id: report.id,
            slot_key: slot.key,
            slot_label: slot.label,
            platform: slot.platform,
            source_url: sourceUrl,
            status: "failed",
            error_message: `${slot.platform} returned ${contentType || "no content type"} instead of a graph image — an authenticated browser session is required to screenshot this graph.`,
          });
          continue;
        }
        const checksum = await sha256Hex(buffer);
        const path = `${report.id}/${slot.key}.png`;
        await supabase.storage.from("captures").upload(path, buffer, { contentType, upsert: true });
        captureRows.push({
          report_id: report.id,
          slot_key: slot.key,
          slot_label: slot.label,
          platform: slot.platform,
          source_url: sourceUrl,
          status: "captured",
          image_path: path,
          checksum,
          captured_at: new Date().toISOString(),
        });
      } catch (error) {
        captureRows.push({
          report_id: report.id,
          slot_key: slot.key,
          slot_label: slot.label,
          platform: slot.platform,
          source_url: sourceUrl,
          status: "failed",
          error_message: error instanceof Error ? error.message : "Capture failed.",
        });
      }
    }

    if (captureRows.length > 0) await supabase.from("report_captures").insert(captureRows as never);

    const { data: captures } = await supabase
      .from("report_captures")
      .select("*")
      .eq("report_id", report.id)
      .order("created_at");

    const enriched: CaptureRow[] = [];
    for (const c of captures ?? []) {
      let previewUrl: string | null = null;
      if (c.image_path) {
        const signed = await supabase.storage.from("captures").createSignedUrl(c.image_path, 3600);
        previewUrl = signed.data?.signedUrl ?? null;
      }
      enriched.push({
        id: c.id,
        slot_key: c.slot_key,
        slot_label: c.slot_label,
        platform: c.platform,
        source_url: c.source_url,
        status: c.status,
        error_message: c.error_message,
        checksum: c.checksum,
        ocr_text: c.ocr_text,
        ocr_ok: c.ocr_ok,
        approved: c.approved,
        captured_at: c.captured_at,
        preview_url: previewUrl,
      });
    }

    const html = buildReportHtml({
      title: report.name,
      periodLabel: data.periodLabel,
      bodyText: template.body_text,
      placeholders: (template.placeholders as TemplateRow["placeholders"]) ?? [],
      links: (links ?? []) as never,
      captures: enriched,
      generatedBy: data.actor,
    });

    const failed = enriched.filter((c) => c.status !== "captured").length;
    const status = platformErrors.length > 0 || failed > 0 ? "needs_attention" : "preview";
    await supabase
      .from("reports")
      .update({
        status,
        html,
        error_message:
          platformErrors.length > 0 ? platformErrors.map((p) => `${p.platform}: ${p.message}`).join(" | ") : null,
      })
      .eq("id", report.id);

    await supabase.from("activity_logs").insert({
      actor: data.actor,
      action: "report.generated",
      resource: report.name,
      result: platformErrors.length > 0 ? "failure" : "success",
    });

    return {
      report: {
        id: report.id,
        name: report.name,
        template_label: report.template_label,
        status,
        format: report.format,
        created_by: report.created_by,
        period_label: report.period_label,
        error_message: null,
        approved_at: null,
        created_at: report.created_at,
      },
      captures: enriched,
      html,
      platformErrors,
    };
  });

export const approveCapture = createServerFn({ method: "POST" })
  .inputValidator((input: { captureId: string; approved: boolean; actor: string }) => input)
  .handler(async ({ data }) => {
    const supabase = await db();
    await supabase.from("report_captures").update({ approved: data.approved }).eq("id", data.captureId);
    return { ok: true };
  });

export const finaliseReport = createServerFn({ method: "POST" })
  .inputValidator((input: { reportId: string; html?: string; actor: string }) => input)
  .handler(async ({ data }) => {
    const supabase = await db();
    const patch: Record<string, unknown> = {
      status: "generated",
      approved_at: new Date().toISOString(),
    };
    if (data.html) patch["html"] = data.html;
    await supabase.from("reports").update(patch as never).eq("id", data.reportId);
    const { data: row } = await supabase.from("reports").select("name").eq("id", data.reportId).single();
    await supabase
      .from("activity_logs")
      .insert({ actor: data.actor, action: "report.approved", resource: row?.name ?? data.reportId });
    return { ok: true };
  });

export const setReportFormat = createServerFn({ method: "POST" })
  .inputValidator((input: { reportId: string; format: string }) => input)
  .handler(async ({ data }) => {
    const supabase = await db();
    await supabase.from("reports").update({ format: data.format }).eq("id", data.reportId);
    return { ok: true };
  });

export const getReport = createServerFn({ method: "POST" })
  .inputValidator((input: { reportId: string }) => input)
  .handler(async ({ data }): Promise<{ name: string; html: string; captures: CaptureRow[] }> => {
    const supabase = await db();
    const { data: report } = await supabase.from("reports").select("*").eq("id", data.reportId).single();
    if (!report) throw new Error("Report not found.");
    const { data: captures } = await supabase
      .from("report_captures")
      .select("*")
      .eq("report_id", data.reportId)
      .order("created_at");
    const enriched: CaptureRow[] = [];
    for (const c of captures ?? []) {
      let previewUrl: string | null = null;
      if (c.image_path) {
        const signed = await supabase.storage.from("captures").createSignedUrl(c.image_path, 3600);
        previewUrl = signed.data?.signedUrl ?? null;
      }
      enriched.push({
        id: c.id,
        slot_key: c.slot_key,
        slot_label: c.slot_label,
        platform: c.platform,
        source_url: c.source_url,
        status: c.status,
        error_message: c.error_message,
        checksum: c.checksum,
        ocr_text: c.ocr_text,
        ocr_ok: c.ocr_ok,
        approved: c.approved,
        captured_at: c.captured_at,
        preview_url: previewUrl,
      });
    }
    return { name: report.name, html: report.html ?? "", captures: enriched };
  });

export const deleteReport = createServerFn({ method: "POST" })
  .inputValidator((input: { reportId: string; actor: string }) => input)
  .handler(async ({ data }) => {
    const supabase = await db();
    const { data: row } = await supabase.from("reports").select("name").eq("id", data.reportId).single();
    await supabase.from("reports").delete().eq("id", data.reportId);
    await supabase
      .from("activity_logs")
      .insert({ actor: data.actor, action: "report.deleted", resource: row?.name ?? data.reportId });
    return { ok: true };
  });

/* ---------------------------------- users --------------------------------- */

export const listUsers = createServerFn({ method: "GET" }).handler(async (): Promise<AppUserRow[]> => {
  const supabase = await db();
  const { data } = await supabase
    .from("app_users")
    .select("id, name, email, role, status, integration, is_protected, last_login_at")
    .order("created_at");
  return (data ?? []) as AppUserRow[];
});

export const saveUser = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { id?: string; name: string; email: string; role: string; integration?: string; actor: string }) => input,
  )
  .handler(async ({ data }) => {
    const supabase = await db();
    const patch = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role,
      integration: data.integration?.trim() || "None assigned",
    };
    const saved = data.id
      ? await supabase.from("app_users").update(patch).eq("id", data.id).select("*").single()
      : await supabase.from("app_users").insert(patch).select("*").single();
    if (saved.error) throw new Error(saved.error.message);
    await supabase.from("activity_logs").insert({
      actor: data.actor,
      action: data.id ? "user.updated" : "user.created",
      resource: patch.email,
    });
    return { ok: true };
  });

export const setUserStatus = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; status: string; actor: string }) => input)
  .handler(async ({ data }) => {
    const supabase = await db();
    const { data: row } = await supabase.from("app_users").select("*").eq("id", data.id).single();
    if (!row) throw new Error("User not found.");
    if (row.is_protected) throw new Error("The system administrator account cannot be suspended.");
    await supabase.from("app_users").update({ status: data.status }).eq("id", data.id);
    await supabase
      .from("activity_logs")
      .insert({ actor: data.actor, action: `user.${data.status.toLowerCase()}`, resource: row.email });
    return { ok: true };
  });

export const deleteUser = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; actor: string }) => input)
  .handler(async ({ data }) => {
    const supabase = await db();
    const { data: row } = await supabase.from("app_users").select("*").eq("id", data.id).single();
    if (!row) throw new Error("User not found.");
    if (row.is_protected) throw new Error("The system administrator account cannot be deleted.");
    await supabase.from("app_users").delete().eq("id", data.id);
    await supabase.from("activity_logs").insert({ actor: data.actor, action: "user.deleted", resource: row.email });
    return { ok: true };
  });

/* -------------------------------- overview -------------------------------- */

export const getOverview = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await db();
  const [templates, reports, links, files, integrations, logs] = await Promise.all([
    supabase.from("report_templates").select("id", { count: "exact", head: true }),
    supabase.from("reports").select("id, status", { count: "exact" }),
    supabase.from("infrastructure_links").select("id", { count: "exact", head: true }),
    supabase.from("infrastructure_files").select("id", { count: "exact", head: true }),
    supabase.from("integrations").select("id, name, status, last_checked_at"),
    supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(8),
  ]);
  const reportRows = reports.data ?? [];
  return {
    templates: templates.count ?? 0,
    reports: reports.count ?? 0,
    generated: reportRows.filter((r) => r.status === "generated").length,
    needsAttention: reportRows.filter((r) => r.status === "needs_attention").length,
    links: links.count ?? 0,
    files: files.count ?? 0,
    integrations: (integrations.data ?? []).map((i) => ({
      id: i.id,
      name: i.name,
      status: i.status,
      last_checked_at: i.last_checked_at,
    })),
    recentLogs: (logs.data ?? []) as LogRow[],
  };
});