import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, FileStack, FileText, PlayCircle, RefreshCw, Table2 } from "lucide-react";

import { PageHeading } from "@/components/noc/PageHeading";
import { StatusBadge } from "@/components/noc/StatusDot";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { reportJobs, stageLabels, wordTemplates } from "@/lib/report-data";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Report Creation Dashboard | MTL Report Platform" },
      {
        name: "description",
        content:
          "NOC engineer dashboard for MTL automated report creation: template runs, graph capture progress and finished report documents.",
      },
      { property: "og:title", content: "Report Creation Dashboard | MTL Report Platform" },
      {
        property: "og:description",
        content: "Track Word template runs, graph capture and generated MTL report documents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function StatCard({
  label,
  value,
  icon: Icon,
  children,
  to,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  children?: React.ReactNode;
  to: string;
  highlight?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`panel block p-5 transition-colors hover:border-mtl-blue/50 ${highlight ? "border-mtl-yellow/60 bg-mtl-yellow/8" : ""}`}
    >
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
        <span className="grid h-8 w-8 place-items-center rounded-md bg-mtl-blue/10 text-mtl-blue">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-extrabold">{value}</p>
      <div className="mt-3">{children}</div>
    </Link>
  );
}

function DashboardPage() {
  const active = reportJobs.filter((j) => j.stage !== "completed" && j.stage !== "failed");
  const activeTemplate = wordTemplates.find((t) => t.active) ?? wordTemplates[0]!;

  return (
    <>
      <PageHeading
        title="Report Creation Dashboard"
        subtitle={`Active template: ${activeTemplate.file} · today's graphs captured 06:04`}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link to="/reports">
                <RefreshCw className="mr-2 h-4 w-4" /> View report runs
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/reports">
                <PlayCircle className="mr-2 h-4 w-4" /> Create today's report
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Word Templates" value={String(wordTemplates.length)} icon={FileStack} to="/templates">
          <p className="text-xs text-muted-foreground">
            {activeTemplate.placeholders} placeholders · {activeTemplate.graphSlots} graph slots detected
          </p>
        </StatCard>

        <StatCard label="Runs in progress" value={String(active.length)} icon={PlayCircle} to="/reports" highlight>
          <div className="flex flex-wrap gap-2">
            {active.map((j) => (
              <StatusBadge key={j.id} tone="info" pulse>
                {stageLabels[j.stage]}
              </StatusBadge>
            ))}
          </div>
        </StatCard>

        <StatCard label="Reports created (24h)" value="12" icon={FileText} to="/reports">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowUpRight className="h-3.5 w-3.5 text-status-ok" /> 11 duplicated from template · 1 failed
          </p>
        </StatCard>

        <StatCard label="Infrastructure rows" value="214" icon={Table2} to="/uploads">
          <p className="text-xs text-muted-foreground">
            From MTL_Infrastructure_Aug2026.xlsx · 3 invalid rows
          </p>
        </StatCard>
      </div>

      <div className="mt-5">
        <section className="panel p-5">
          <h3 className="text-base font-bold">How a report is produced</h3>
          <p className="text-xs text-muted-foreground">The platform never polls the network itself</p>
          <ol className="mt-4 space-y-3">
            {[
              { step: "Read the Word template", detail: "Sections, tables and graph placeholders are extracted from the .docx" },
              { step: "Resolve infrastructure", detail: "Excel workbook says which customer links belong in the report" },
              { step: "Capture today's graphs", detail: "Screenshots pulled from the existing graph sources" },
              { step: "Duplicate the template", detail: "Same layout, today's graphs, figures and observations" },
              { step: "Publish PDF & Word", detail: "Stored in the archive for management review" },
            ].map((s, i) => (
              <li key={s.step} className="flex gap-3 rounded-md border border-border bg-secondary/50 p-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-mtl-blue text-[11px] font-bold text-mtl-blue-foreground">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold">{s.step}</p>
                  <p className="text-[11px] text-muted-foreground">{s.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          <Button asChild variant="outline" className="mt-4 w-full" size="sm">
            <Link to="/templates">Open template manager</Link>
          </Button>
        </section>
      </div>
    </>
  );
}