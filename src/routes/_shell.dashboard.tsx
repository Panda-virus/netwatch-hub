import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileStack, FileText, PlayCircle, Plug, Table2 } from "lucide-react";

import { PageHeading } from "@/components/noc/PageHeading";
import { StatusBadge } from "@/components/noc/StatusDot";
import { Button } from "@/components/ui/button";
import { getOverview } from "@/lib/platform.functions";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Report Creation Dashboard | MTL Report Platform" },
      {
        name: "description",
        content:
          "NOC engineer dashboard for MTL automated report creation: templates read, graph sources, infrastructure links and generated report documents.",
      },
      { property: "og:title", content: "Report Creation Dashboard | MTL Report Platform" },
      {
        property: "og:description",
        content: "Track Word templates, graph sources and generated MTL report documents.",
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
  const { data } = useQuery({ queryKey: ["overview"], queryFn: () => getOverview() });

  return (
    <>
      <PageHeading
        title="Report Creation Dashboard"
        subtitle="Everything shown here is read from the platform database"
        actions={
          <Button asChild size="sm">
            <Link to="/reports">
              <PlayCircle className="mr-2 h-4 w-4" /> Create a report
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Word templates" value={String(data?.templates ?? 0)} icon={FileStack} to="/reports">
          <p className="text-xs text-muted-foreground">Uploaded and read for placeholders and graph slots</p>
        </StatCard>

        <StatCard label="Reports generated" value={String(data?.generated ?? 0)} icon={FileText} to="/reports" highlight>
          <p className="text-xs text-muted-foreground">
            {data?.reports ?? 0} total runs · {data?.needsAttention ?? 0} need attention
          </p>
        </StatCard>

        <StatCard label="Infrastructure links" value={String(data?.links ?? 0)} icon={Table2} to="/uploads">
          <p className="text-xs text-muted-foreground">From {data?.files ?? 0} uploaded workbook(s)</p>
        </StatCard>

        <StatCard label="Graph sources" value={String(data?.integrations.length ?? 0)} icon={Plug} to="/integrations">
          <div className="flex flex-wrap gap-2">
            {(data?.integrations ?? []).map((i) => (
              <StatusBadge key={i.id} tone={i.status === "connected" ? "ok" : i.status === "degraded" ? "warn" : "crit"}>
                {i.name}
              </StatusBadge>
            ))}
          </div>
        </StatCard>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <section className="panel p-5">
          <h3 className="text-base font-bold">How a report is produced</h3>
          <p className="text-xs text-muted-foreground">The platform never polls the network itself</p>
          <ol className="mt-4 space-y-3">
            {[
              { step: "Read the Word template", detail: "Placeholders and graph slots are extracted from the .docx" },
              { step: "Resolve infrastructure", detail: "The Excel workbook says which major links belong in the report" },
              { step: "Sign in and capture", detail: "SolarWinds and Observium graphs are captured for those links" },
              { step: "Duplicate the template", detail: "Same structure, today's graphs, figures and observations" },
              { step: "Review and download", detail: "You verify the preview, then download HTML or PDF" },
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
        </section>

        <section className="panel overflow-hidden">
          <div className="border-b border-border p-5">
            <h3 className="text-base font-bold">Recent platform activity</h3>
            <p className="text-xs text-muted-foreground">Uploads, connection tests and report actions</p>
          </div>
          <ul className="divide-y divide-border">
            {(data?.recentLogs ?? []).length === 0 ? (
              <li className="p-5 text-sm text-muted-foreground">No activity recorded yet.</li>
            ) : null}
            {(data?.recentLogs ?? []).map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-3 p-4">
                <StatusBadge tone={l.result === "success" ? "ok" : "crit"}>{l.result}</StatusBadge>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{l.action}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {l.actor}
                    {l.resource ? ` · ${l.resource}` : ""}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
