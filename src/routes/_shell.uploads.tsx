import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, FileSpreadsheet, TriangleAlert, Upload } from "lucide-react";

import { PageHeading } from "@/components/noc/PageHeading";
import { StatusBadge } from "@/components/noc/StatusDot";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_shell/uploads")({
  head: () => ({
    meta: [
      { title: "Infrastructure File Uploads | MTL ANPMRS" },
      {
        name: "description",
        content:
          "Upload MTL infrastructure Excel workbooks, map columns to customers, links, devices and interfaces, and review import summaries.",
      },
      { property: "og:title", content: "Infrastructure File Uploads | MTL ANPMRS" },
      {
        property: "og:description",
        content: "Excel-driven infrastructure imports powering automated MTL report generation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UploadsPage,
});

const files: Array<{
  name: string;
  uploaded: string;
  by: string;
  status: "imported" | "invalid";
  summary: {
    customers: number;
    services: number;
    links: number;
    devices: number;
    interfaces: number;
    invalid: number;
    duplicates: number;
  };
}> = [
  {
    name: "MTL_Infrastructure_Aug2026.xlsx",
    uploaded: "2026-08-07 06:12",
    by: "G. Phiri",
    summary: { customers: 142, services: 168, links: 214, devices: 96, interfaces: 231, invalid: 3, duplicates: 7 },
    status: "imported",
  },
  {
    name: "MTL_Infrastructure_Jul2026.xlsx",
    uploaded: "2026-07-03 06:08",
    by: "T. Banda",
    summary: { customers: 139, services: 161, links: 205, devices: 94, interfaces: 220, invalid: 1, duplicates: 4 },
    status: "imported",
  },
  {
    name: "MTL_Links_Draft.xlsx",
    uploaded: "2026-07-01 15:44",
    by: "A. Nyirenda",
    summary: { customers: 0, services: 0, links: 0, devices: 0, interfaces: 0, invalid: 0, duplicates: 0 },
    status: "invalid",
  },
];

function UploadsPage() {
  const latest = files[0]!;

  return (
    <>
      <PageHeading
        title="Infrastructure File Uploads"
        subtitle="The Excel workbook defines where infrastructure exists; templates define what must be reported"
        actions={
          <label className="inline-flex">
            <input
              type="file"
              accept=".xlsx,.xls"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) toast.success(`${file.name} uploaded — parsing columns`);
              }}
            />
            <span className="inline-flex h-9 cursor-pointer items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Upload className="mr-2 h-4 w-4" /> Upload workbook
            </span>
          </label>
        }
      />

      <section className="panel p-6">
        <div className="rounded-md border-2 border-dashed border-border p-8 text-center">
          <FileSpreadsheet className="mx-auto h-8 w-8 text-mtl-blue" />
          <p className="mt-3 text-sm font-semibold">Drop an .xlsx or .xls infrastructure workbook here</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Columns are detected automatically and mapped to customer, service, link, circuit ID, device, interface, IP,
            region and monitoring platform.
          </p>
          <Button variant="outline" size="sm" className="mt-4">
            Select file
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-7">
          <Metric label="Customers" value={latest.summary.customers} />
          <Metric label="Services" value={latest.summary.services} />
          <Metric label="Links" value={latest.summary.links} />
          <Metric label="Devices" value={latest.summary.devices} />
          <Metric label="Interfaces" value={latest.summary.interfaces} />
          <Metric label="Invalid" value={latest.summary.invalid} />
          <Metric label="Duplicates" value={latest.summary.duplicates} />
        </div>
      </section>

      <section className="panel mt-5 overflow-hidden">
        <div className="border-b border-border p-5">
          <h3 className="text-base font-bold">Uploaded Files</h3>
          <p className="text-xs text-muted-foreground">Original workbooks retained for audit</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-[11px] tracking-wider text-muted-foreground uppercase">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">File</th>
                <th className="px-4 py-3 text-left font-semibold">Uploaded</th>
                <th className="px-4 py-3 text-left font-semibold">By</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Records</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr key={f.name} className="border-t border-border hover:bg-secondary/50">
                  <td className="px-5 py-3 font-semibold">{f.name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{f.uploaded}</td>
                  <td className="px-4 py-3 text-xs">{f.by}</td>
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
                  <td className="px-5 py-3 text-right font-mono text-xs">
                    {f.summary.links} links · {f.summary.interfaces} interfaces
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

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-secondary/50 p-3">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 font-display text-xl font-bold">{value}</p>
    </div>
  );
}