import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, FileSpreadsheet, Trash2, TriangleAlert, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { PageHeading } from "@/components/noc/PageHeading";
import { StatusBadge } from "@/components/noc/StatusDot";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth";
import { fileToBase64 } from "@/lib/file-upload";
import { deleteInfraFile, listInfraFiles, listInfraLinks } from "@/lib/platform.functions";

export const Route = createFileRoute("/_shell/uploads")({
  head: () => ({
    meta: [
      { title: "Infrastructure File Uploads | MTL Report Platform" },
      {
        name: "description",
        content:
          "Upload MTL infrastructure Excel workbooks, read the major link networks and their Observium and SolarWinds references, and review import summaries.",
      },
      { property: "og:title", content: "Infrastructure File Uploads | MTL Report Platform" },
      {
        property: "og:description",
        content: "Excel-driven infrastructure imports powering MTL report generation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UploadsPage,
});

const METRICS: Array<{ key: string; label: string }> = [
  { key: "links", label: "Major links" },
  { key: "customers", label: "Customers" },
  { key: "devices", label: "Devices" },
  { key: "observium_mapped", label: "Observium refs" },
  { key: "solarwinds_mapped", label: "SolarWinds refs" },
  { key: "invalid", label: "Invalid rows" },
  { key: "duplicates", label: "Duplicates" },
];

function UploadsPage() {
  const session = useSession();
  const actor = session?.email ?? "unknown";
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<string | undefined>(undefined);

  const { data: files = [], isLoading } = useQuery({ queryKey: ["infra-files"], queryFn: () => listInfraFiles() });
  const activeFileId = selected ?? files.find((f) => f.status === "imported")?.id;
  const { data: links = [] } = useQuery({
    queryKey: ["infra-links", activeFileId ?? "latest"],
    queryFn: () => listInfraLinks({ data: { fileId: activeFileId } }),
  });

  const latest = files.find((f) => f.id === activeFileId) ?? files[0];

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const row = await uploadWorkbook(file.name, base64, actor);
      await queryClient.invalidateQueries({ queryKey: ["infra-files"] });
      await queryClient.invalidateQueries({ queryKey: ["infra-links"] });
      setSelected(row.id);
      toast.success(`${row.filename} imported — ${row.summary["links"] ?? 0} major links read.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The workbook could not be read.");
      await queryClient.invalidateQueries({ queryKey: ["infra-files"] });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <PageHeading
        title="Infrastructure File Uploads"
        subtitle="The Excel workbook defines the major link networks; the Word template defines what must be reported"
        actions={
          <label className="inline-flex">
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file);
              }}
            />
            <span className="inline-flex h-9 cursor-pointer items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Reading workbook…" : "Upload infrastructure file"}
            </span>
          </label>
        }
      />

      <section className="panel p-6">
        <button
          type="button"
          className="w-full rounded-md border-2 border-dashed border-border p-8 text-center hover:border-mtl-blue/50"
          onClick={() => inputRef.current?.click()}
        >
          <FileSpreadsheet className="mx-auto h-8 w-8 text-mtl-blue" />
          <p className="mt-3 text-sm font-semibold">Select an .xlsx or .xls infrastructure workbook</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Columns are detected automatically and mapped to customer, link, circuit ID, bandwidth, device, interface,
            region and the Observium / SolarWinds graph references.
          </p>
        </button>

        {latest ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-7">
            {METRICS.map((m) => (
              <div key={m.key} className="rounded-md border border-border bg-secondary/50 p-3">
                <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">{m.label}</p>
                <p className="mt-1 font-display text-xl font-bold">{latest.summary[m.key] ?? 0}</p>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="panel mt-5 overflow-hidden">
        <div className="border-b border-border p-5">
          <h3 className="text-base font-bold">Uploaded workbooks</h3>
          <p className="text-xs text-muted-foreground">Original files retained for audit</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-[11px] tracking-wider text-muted-foreground uppercase">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">File</th>
                <th className="px-4 py-3 text-left font-semibold">Uploaded</th>
                <th className="px-4 py-3 text-left font-semibold">By</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Records</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-sm text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              ) : null}
              {!isLoading && files.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-sm text-muted-foreground">
                    No workbook uploaded yet.
                  </td>
                </tr>
              ) : null}
              {files.map((f) => (
                <tr
                  key={f.id}
                  className={`border-t border-border hover:bg-secondary/50 ${f.id === activeFileId ? "bg-mtl-blue/5" : ""}`}
                >
                  <td className="px-5 py-3">
                    <p className="font-semibold">{f.filename}</p>
                    {f.error_message ? <p className="text-[11px] text-status-crit">{f.error_message}</p> : null}
                    {f.sheet_names.length ? (
                      <p className="text-[11px] text-muted-foreground">Sheets: {f.sheet_names.join(", ")}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(f.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs">{f.uploaded_by ?? "—"}</td>
                  <td className="px-4 py-3">
                    {f.status === "imported" ? (
                      <StatusBadge tone="ok">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Imported
                      </StatusBadge>
                    ) : (
                      <StatusBadge tone="crit">
                        <TriangleAlert className="mr-1 h-3 w-3" /> Invalid file
                      </StatusBadge>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {f.summary["links"] ?? 0} links · {f.summary["customers"] ?? 0} customers
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelected(f.id)}>
                        View links
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await deleteInfraFile({ data: { id: f.id, actor } });
                          setSelected(undefined);
                          await queryClient.invalidateQueries({ queryKey: ["infra-files"] });
                          await queryClient.invalidateQueries({ queryKey: ["infra-links"] });
                          toast.success(`${f.filename} removed.`);
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

      <section className="panel mt-5 overflow-hidden">
        <div className="border-b border-border p-5">
          <h3 className="text-base font-bold">Major links read from the workbook</h3>
          <p className="text-xs text-muted-foreground">
            {links.length} link{links.length === 1 ? "" : "s"} available to the report generator
          </p>
        </div>
        <div className="max-h-[520px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-secondary text-[11px] tracking-wider text-muted-foreground uppercase">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Link</th>
                <th className="px-4 py-3 text-left font-semibold">Customer</th>
                <th className="px-4 py-3 text-left font-semibold">Circuit</th>
                <th className="px-4 py-3 text-left font-semibold">Bandwidth</th>
                <th className="px-4 py-3 text-left font-semibold">Device / interface</th>
                <th className="px-5 py-3 text-left font-semibold">Graph refs</th>
              </tr>
            </thead>
            <tbody>
              {links.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-sm text-muted-foreground">
                    No links yet — upload a workbook that lists the major link networks.
                  </td>
                </tr>
              ) : null}
              {links.map((l) => (
                <tr key={l.id} className="border-t border-border hover:bg-secondary/50">
                  <td className="px-5 py-3 font-semibold">{l.link_name}</td>
                  <td className="px-4 py-3 text-xs">{l.customer ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{l.circuit_id ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">{l.bandwidth_mbps ? `${l.bandwidth_mbps} Mbps` : "—"}</td>
                  <td className="px-4 py-3 text-xs">
                    {l.device ?? "—"}
                    {l.interface_name ? ` · ${l.interface_name}` : ""}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {l.observium_ref ? <StatusBadge tone="info">Observium</StatusBadge> : null}
                      {l.solarwinds_ref ? <StatusBadge tone="info">SolarWinds</StatusBadge> : null}
                      {!l.observium_ref && !l.solarwinds_ref ? (
                        <StatusBadge tone="warn">No graph ref</StatusBadge>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

async function uploadWorkbook(filename: string, base64: string, actor: string) {
  const { uploadInfraFile } = await import("@/lib/platform.functions");
  return uploadInfraFile({ data: { filename, base64, actor } });
}
