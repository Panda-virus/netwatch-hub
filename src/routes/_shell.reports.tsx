import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Download,
  FileStack,
  Play,
  Trash2,
  TriangleAlert,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { PageHeading } from "@/components/noc/PageHeading";
import { StatusBadge } from "@/components/noc/StatusDot";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth";
import { downloadBlob, fileToBase64 } from "@/lib/file-upload";
import type { GenerateResult, ReportRow, TemplateRow } from "@/lib/platform-types";
import {
  activateTemplate,
  approveCapture,
  deleteReport,
  deleteTemplate,
  finaliseReport,
  generateReport,
  getReport,
  listReports,
  listTemplates,
  setReportFormat,
  uploadTemplate,
} from "@/lib/platform.functions";

export const Route = createFileRoute("/_shell/reports")({
  head: () => ({
    meta: [
      { title: "Report Creation & Templates | MTL Report Platform" },
      {
        name: "description",
        content:
          "Upload the MTL Word report template, generate a report from the day's SolarWinds and Observium graphs, preview it and download as HTML or PDF.",
      },
      { property: "og:title", content: "Report Creation & Templates | MTL Report Platform" },
      {
        property: "og:description",
        content: "Generate MTL reports from a Word template and the day's captured graphs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const session = useSession();
  const actor = session?.email ?? "unknown";
  const queryClient = useQueryClient();
  const templateInput = useRef<HTMLInputElement>(null);

  const { data: templates = [] } = useQuery({ queryKey: ["templates"], queryFn: () => listTemplates() });
  const { data: reports = [] } = useQuery({ queryKey: ["reports"], queryFn: () => listReports() });

  const [uploading, setUploading] = useState(false);
  const [runOpen, setRunOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [templateId, setTemplateId] = useState<string>("");
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 10));
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [editedHtml, setEditedHtml] = useState("");
  const [finalising, setFinalising] = useState(false);

  const activeTemplate = templates.find((t) => t.is_active) ?? templates[0];
  const chosen = templates.find((t) => t.id === (templateId || activeTemplate?.id));

  async function handleTemplateUpload(file: File) {
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const row = await uploadTemplate({ data: { filename: file.name, base64, actor } });
      await queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success(
        `${row.filename} read — ${row.placeholders.length} placeholders and ${row.graph_slots.length} graph slots detected.`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The template could not be read.");
    } finally {
      setUploading(false);
      if (templateInput.current) templateInput.current.value = "";
    }
  }

  async function handleGenerate() {
    const id = templateId || activeTemplate?.id;
    if (!id) {
      toast.error("Upload a Word report template first.");
      return;
    }
    setRunning(true);
    try {
      const res = await generateReport({ data: { templateId: id, periodLabel: period, actor } });
      setResult(res);
      setEditedHtml(res.html);
      setRunOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["reports"] });
      if (res.platformErrors.length > 0) {
        toast.error(`${res.platformErrors.length} graph source could not be reached — see the preview.`);
      } else {
        toast.success("Graphs captured — review the preview before generating.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The report run failed.");
    } finally {
      setRunning(false);
    }
  }

  async function handleFinalise() {
    if (!result) return;
    setFinalising(true);
    try {
      await finaliseReport({ data: { reportId: result.report.id, html: editedHtml, actor } });
      await queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success(`${result.report.name} generated and stored in the archive.`);
      setResult(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not finalise the report.");
    } finally {
      setFinalising(false);
    }
  }

  async function handleDownload(row: ReportRow) {
    try {
      const doc = await getReport({ data: { reportId: row.id } });
      if (!doc.html) {
        toast.error("This report has no document yet — generate it first.");
        return;
      }
      if (row.format === "HTML") {
        downloadBlob(`${row.name.replace(/[^a-z0-9]+/gi, "_")}.html`, doc.html, "text/html");
        toast.success(`${row.name} downloaded as HTML.`);
        return;
      }
      const win = window.open("", "_blank");
      if (!win) {
        toast.error("Allow pop-ups to save the PDF.");
        return;
      }
      win.document.write(doc.html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 400);
      toast.success("Print dialog opened — choose 'Save as PDF'.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The download failed.");
    }
  }

  return (
    <>
      <PageHeading
        title="Report Creation & Templates"
        subtitle={
          activeTemplate
            ? `Active template: ${activeTemplate.filename} · ${activeTemplate.graph_slots.length} graph slots`
            : "Upload a Word report template to begin"
        }
        actions={
          <>
            <Button size="sm" onClick={() => setRunOpen(true)}>
              <Play className="mr-2 h-4 w-4" /> Generate report
            </Button>
            <label className="inline-flex">
              <input
                ref={templateInput}
                type="file"
                accept=".docx"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleTemplateUpload(file);
                }}
              />
              <span className="inline-flex h-9 cursor-pointer items-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent">
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Reading template…" : "Upload report template"}
              </span>
            </label>
          </>
        }
      />

      <section className="panel overflow-hidden">
        <div className="border-b border-border p-5">
          <h3 className="text-base font-bold">Word report templates</h3>
          <p className="text-xs text-muted-foreground">
            The platform reads the .docx, then duplicates its structure with the day's graphs and figures
          </p>
        </div>
        {templates.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            No template uploaded yet. Use “Upload report template” above.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {templates.map((t) => (
              <TemplateItem key={t.id} template={t} actor={actor} />
            ))}
          </ul>
        )}
      </section>

      <section className="panel mt-5 overflow-hidden">
        <div className="border-b border-border p-5">
          <h3 className="text-base font-bold">Generated reports</h3>
          <p className="text-xs text-muted-foreground">Choose a download format per report</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-[11px] tracking-wider text-muted-foreground uppercase">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Report name</th>
                <th className="px-4 py-3 text-left font-semibold">Created</th>
                <th className="px-4 py-3 text-left font-semibold">By</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Format</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-sm text-muted-foreground">
                    No reports generated yet.
                  </td>
                </tr>
              ) : null}
              {reports.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-secondary/50">
                  <td className="px-5 py-3">
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-[11px] text-muted-foreground">{r.template_label ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs">{r.created_by ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      tone={r.status === "generated" ? "ok" : r.status === "needs_attention" ? "crit" : "info"}
                    >
                      {r.status.replace(/_/g, " ")}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={r.format}
                      onValueChange={async (value) => {
                        await setReportFormat({ data: { reportId: r.id, format: value } });
                        await queryClient.invalidateQueries({ queryKey: ["reports"] });
                        toast.success(`${r.name} will download as ${value}.`);
                      }}
                    >
                      <SelectTrigger className="h-8 w-[110px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="HTML">HTML</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => void handleDownload(r)}>
                        <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          await deleteReport({ data: { reportId: r.id, actor } });
                          await queryClient.invalidateQueries({ queryKey: ["reports"] });
                          toast.success(`${r.name} deleted.`);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* run dialog */}
      <Dialog open={runOpen} onOpenChange={setRunOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate report</DialogTitle>
            <DialogDescription>
              The platform reads the template structure, signs in to each graph source with the stored credentials and
              captures only the graphs the template asks for.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Template
              </Label>
              <Select value={templateId || activeTemplate?.id || ""} onValueChange={setTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {chosen ? (
                <p className="text-[11px] text-muted-foreground">
                  {chosen.placeholders.length} placeholders · {chosen.graph_slots.length} graph slots to capture
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Reporting period
              </Label>
              <Input value={period} onChange={(e) => setPeriod(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRunOpen(false)}>
              Cancel
            </Button>
            <Button disabled={running} onClick={() => void handleGenerate()}>
              {running ? "Capturing graphs…" : "Start capture"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* preview dialog */}
      <Dialog open={result !== null} onOpenChange={(open) => !open && setResult(null)}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview · {result?.report.name}</DialogTitle>
            <DialogDescription>
              Check every capture and the document below. Tapping “Generate” confirms the report is correct.
            </DialogDescription>
          </DialogHeader>

          {result?.platformErrors.length ? (
            <div className="space-y-3">
              {result.platformErrors.map((e) => (
                <div key={`${e.platform}-${e.url}`} className="rounded-md border border-status-crit/50 bg-status-crit/8 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-status-crit">
                    <TriangleAlert className="h-4 w-4" /> {e.platform} could not be accessed
                  </p>
                  <p className="mt-1 font-mono text-[11px] break-all text-muted-foreground">{e.url}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{e.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-status-ok/50 bg-status-ok/8 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-status-ok">
                <CheckCircle2 className="h-4 w-4" /> All graph sources reachable
              </p>
            </div>
          )}

          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-[11px] tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Graph slot</th>
                  <th className="px-4 py-2 text-left font-semibold">Platform</th>
                  <th className="px-4 py-2 text-left font-semibold">Capture</th>
                  <th className="px-4 py-2 text-left font-semibold">Verification</th>
                  <th className="px-4 py-2 text-right font-semibold">Approve</th>
                </tr>
              </thead>
              <tbody>
                {(result?.captures ?? []).map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-4 py-2">
                      <p className="font-semibold">{c.slot_label ?? c.slot_key}</p>
                      <p className="font-mono text-[10px] break-all text-muted-foreground">{c.source_url ?? "—"}</p>
                    </td>
                    <td className="px-4 py-2 text-xs">{c.platform}</td>
                    <td className="px-4 py-2">
                      <StatusBadge tone={c.status === "captured" ? "ok" : "crit"}>{c.status}</StatusBadge>
                      {c.error_message ? (
                        <p className="mt-1 text-[10px] text-status-crit">{c.error_message}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-2 text-[11px] text-muted-foreground">
                      {c.checksum ? `checksum ${c.checksum.slice(0, 10)}…` : "no image"}
                      {c.ocr_ok === false ? " · text check failed" : c.ocr_ok ? " · text check passed" : ""}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Button
                        size="sm"
                        variant={c.approved ? "default" : "outline"}
                        onClick={async () => {
                          await approveCapture({ data: { captureId: c.id, approved: !c.approved, actor } });
                          setResult((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  captures: prev.captures.map((x) =>
                                    x.id === c.id ? { ...x, approved: !x.approved } : x,
                                  ),
                                }
                              : prev,
                          );
                        }}
                      >
                        {c.approved ? "Approved" : "Approve"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Document preview
            </Label>
            <div
              className="max-h-80 overflow-y-auto rounded-md border border-border bg-white p-4 text-black"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: editedHtml }}
            />
            <details>
              <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
                Edit the document before generating
              </summary>
              <Textarea
                className="mt-2 h-48 font-mono text-xs"
                value={editedHtml}
                onChange={(e) => setEditedHtml(e.target.value)}
              />
            </details>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResult(null)}>
              Discard
            </Button>
            <Button disabled={finalising} onClick={() => void handleFinalise()}>
              {finalising ? "Generating…" : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TemplateItem({ template, actor }: { template: TemplateRow; actor: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  return (
    <li className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-bold">
            <FileStack className="h-4 w-4 text-mtl-blue" /> {template.label}
          </p>
          <p className="font-mono text-[11px] text-muted-foreground">{template.filename}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {template.placeholders.length} placeholders · {template.graph_slots.length} graph slots · uploaded{" "}
            {new Date(template.created_at).toLocaleString()} by {template.uploaded_by ?? "unknown"}
          </p>
        </div>
        <StatusBadge tone={template.is_active ? "ok" : "info"}>
          {template.is_active ? "Active template" : "Available"}
        </StatusBadge>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setOpen((v) => !v)}>
          {open ? "Hide detected content" : "View detected content"}
        </Button>
        {!template.is_active ? (
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              await activateTemplate({ data: { id: template.id, actor } });
              await queryClient.invalidateQueries({ queryKey: ["templates"] });
              toast.success(`${template.label} is now the active template.`);
            }}
          >
            Set as active
          </Button>
        ) : null}
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            await deleteTemplate({ data: { id: template.id, actor } });
            await queryClient.invalidateQueries({ queryKey: ["templates"] });
            toast.success(`${template.label} deleted.`);
          }}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
        </Button>
      </div>

      {open ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-md border border-border">
            <p className="border-b border-border bg-secondary px-3 py-2 text-[11px] font-semibold tracking-wider uppercase">
              Placeholders read from the document
            </p>
            <ul className="divide-y divide-border">
              {template.placeholders.length === 0 ? (
                <li className="px-3 py-2 text-xs text-muted-foreground">None found.</li>
              ) : null}
              {template.placeholders.map((p) => (
                <li key={p.token} className="flex items-center justify-between gap-2 px-3 py-2">
                  <span className="font-mono text-[11px] font-semibold">{p.token}</span>
                  <StatusBadge tone={p.kind === "graph" ? "info" : "ok"}>{p.kind}</StatusBadge>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-border">
            <p className="border-b border-border bg-secondary px-3 py-2 text-[11px] font-semibold tracking-wider uppercase">
              Graph slots to capture
            </p>
            <ul className="divide-y divide-border">
              {template.graph_slots.length === 0 ? (
                <li className="px-3 py-2 text-xs text-muted-foreground">None found.</li>
              ) : null}
              {template.graph_slots.map((g) => (
                <li key={g.key} className="flex items-center justify-between gap-2 px-3 py-2">
                  <span className="text-xs font-semibold">{g.label}</span>
                  <StatusBadge tone="info">{g.platform}</StatusBadge>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </li>
  );
}
