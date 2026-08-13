import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileSpreadsheet, FileText, Play } from "lucide-react";
import { toast } from "sonner";

import { PageHeading } from "@/components/noc/PageHeading";
import { StatusBadge } from "@/components/noc/StatusDot";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generatedReports } from "@/lib/noc-data";

export const Route = createFileRoute("/_shell/reports")({
  head: () => ({
    meta: [
      { title: "Automated Report Generation | MTL ANPMRS" },
      {
        name: "description",
        content:
          "Generate daily, weekly, monthly SLA and incident reports for the MTL network and download them as PDF or Word.",
      },
      { property: "og:title", content: "Automated Report Generation | MTL ANPMRS" },
      {
        property: "og:description",
        content: "Scheduled and on-demand MTL network reports in PDF and Word formats.",
      },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <>
      <PageHeading
        title="Automated Report Generation"
        subtitle="Scheduler active · Daily 06:00, Weekly Monday 07:00, Monthly 1st 08:00"
        actions={
          <StatusBadge tone="ok" pulse>
            Scheduler healthy
          </StatusBadge>
        }
      />

      <section className="panel p-6">
        <h3 className="text-base font-bold">Generate New Report</h3>
        <p className="text-xs text-muted-foreground">
          Data is pulled automatically from Observium, SolarWinds and SNMP archives for the selected scope.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <Field label="Report Type">
            <Select defaultValue="daily">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Network Report</SelectItem>
                <SelectItem value="weekly">Weekly Performance Report</SelectItem>
                <SelectItem value="monthly">Monthly SLA Report</SelectItem>
                <SelectItem value="incident">Incident Report</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Devices">
            <Select defaultValue="core">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="core">Core devices (12)</SelectItem>
                <SelectItem value="edge">Edge & aggregation (238)</SelectItem>
                <SelectItem value="customer">Customer links (612)</SelectItem>
                <SelectItem value="all">All monitored devices (850)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button onClick={() => toast.success("Report run started — reading template and capturing today's graphs")}>
            <Play className="mr-2 h-4 w-4" /> Generate Report
          </Button>
          <Button asChild variant="outline">
            <Link to="/templates">Preview template</Link>
          </Button>
          <p className="text-xs text-muted-foreground">Average generation time: 38 seconds</p>
        </div>
      </section>

      <section className="panel mt-5 overflow-hidden">
        <div className="border-b border-border p-5">
          <h3 className="text-base font-bold">Generated Reports</h3>
          <p className="text-xs text-muted-foreground">Retained 24 months for audit readiness</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-[11px] tracking-wider text-muted-foreground uppercase">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Report Name</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Created By</th>
                <th className="px-4 py-3 text-left font-semibold">Format</th>
                <th className="px-5 py-3 text-right font-semibold">Download</th>
              </tr>
            </thead>
            <tbody>
              {generatedReports.map((r) => (
                <tr key={r.name} className="border-t border-border hover:bg-secondary/50">
                  <td className="px-5 py-3 font-semibold">{r.name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.date}</td>
                  <td className="px-4 py-3 text-xs">{r.by}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                      {r.format === "PDF" ? (
                        <FileText className="h-3.5 w-3.5 text-status-crit" />
                      ) : (
                        <FileSpreadsheet className="h-3.5 w-3.5 text-mtl-blue" />
                      )}
                      {r.format}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="outline" size="sm" onClick={() => toast.success(`Downloading ${r.name}`)}>
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                    </Button>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{label}</Label>
      {children}
    </div>
  );
}
