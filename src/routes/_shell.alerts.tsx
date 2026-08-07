import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BellRing, CheckCircle2, UserPlus } from "lucide-react";

import { PageHeading } from "@/components/noc/PageHeading";
import { StatusBadge, toneForStatus } from "@/components/noc/StatusDot";
import { Button } from "@/components/ui/button";
import { alerts } from "@/lib/noc-data";

export const Route = createFileRoute("/_shell/alerts")({
  head: () => ({
    meta: [
      { title: "Alert Management Centre | MTL ANPMRS" },
      {
        name: "description",
        content:
          "Triage MTL network alerts: acknowledge, assign and resolve critical faults, warnings and resolved incidents.",
      },
      { property: "og:title", content: "Alert Management Centre | MTL ANPMRS" },
      {
        property: "og:description",
        content: "Critical alerts, warnings and resolved incidents with engineer assignment workflow.",
      },
    ],
  }),
  component: AlertsPage,
});

const tabs = ["Critical Alerts", "Warnings", "Resolved Alerts"] as const;

function AlertsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Critical Alerts");

  const rows = alerts.filter((a) =>
    tab === "Critical Alerts"
      ? a.severity === "critical" && a.status !== "Resolved"
      : tab === "Warnings"
        ? a.severity !== "critical" && a.status !== "Resolved"
        : a.status === "Resolved",
  );

  const counts = {
    critical: alerts.filter((a) => a.severity === "critical" && a.status !== "Resolved").length,
    warning: alerts.filter((a) => a.severity !== "critical" && a.status !== "Resolved").length,
    resolved: alerts.filter((a) => a.status === "Resolved").length,
  };

  return (
    <>
      <PageHeading
        title="Alert Management Centre"
        subtitle="Fault detection from SNMP traps, syslog and threshold rules · MTTR 42 minutes this week"
        actions={
          <Button variant="outline" size="sm">
            <BellRing className="mr-2 h-4 w-4" /> Notification rules
          </Button>
        }
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <SummaryTile label="Critical" value={counts.critical} tone="crit" />
        <SummaryTile label="Warnings" value={counts.warning} tone="warn" />
        <SummaryTile label="Resolved (24h)" value={counts.resolved} tone="ok" />
      </div>

      <div className="panel overflow-hidden">
        <div className="flex flex-wrap gap-1 border-b border-border bg-secondary p-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                tab === t ? "bg-mtl-blue text-mtl-blue-foreground" : "text-muted-foreground hover:text-mtl-blue"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] tracking-wider text-muted-foreground uppercase">
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left font-semibold">Alert ID</th>
                <th className="px-4 py-3 text-left font-semibold">Device</th>
                <th className="px-4 py-3 text-left font-semibold">Issue</th>
                <th className="px-4 py-3 text-left font-semibold">Severity</th>
                <th className="px-4 py-3 text-left font-semibold">Time</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Assigned Engineer</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                  <td className="px-5 py-3 font-mono text-xs font-bold">{a.id}</td>
                  <td className="px-4 py-3 font-mono text-xs">{a.device}</td>
                  <td className="max-w-xs px-4 py-3 text-xs">{a.issue}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={toneForStatus(a.severity)} pulse={a.severity === "critical"}>
                      {a.severity}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{a.time}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={toneForStatus(a.status)}>{a.status}</StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-xs">{a.engineer}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        Acknowledge
                      </Button>
                      <Button variant="outline" size="sm">
                        <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Assign
                      </Button>
                      <Button size="sm">
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Resolve
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function SummaryTile({ label, value, tone }: { label: string; value: number; tone: "crit" | "warn" | "ok" }) {
  return (
    <div className="panel flex items-center justify-between p-5">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
        <p className="mt-2 font-display text-3xl font-extrabold">{value}</p>
      </div>
      <StatusBadge tone={tone} pulse={tone === "crit"}>
        {tone === "ok" ? "Cleared" : "Open"}
      </StatusBadge>
    </div>
  );
}
