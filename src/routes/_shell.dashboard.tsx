import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowUpRight,
  FileText,
  Gauge,
  RefreshCw,
  Server,
  Workflow,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeading } from "@/components/noc/PageHeading";
import { StatusBadge, StatusDot } from "@/components/noc/StatusDot";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { devices, healthSegments, trafficSeries } from "@/lib/noc-data";

const recentJobs = [
  { id: "JOB-2041", name: "NB Monthly Infrastructure Report", stage: "completed", tone: "ok" as const, time: "06:04" },
  { id: "JOB-2040", name: "FCB Weekly Link Report", stage: "capturing_screenshots", tone: "info" as const, time: "05:58" },
  { id: "JOB-2039", name: "All Customers Daily Summary", stage: "generating_pdf", tone: "info" as const, time: "05:41" },
  { id: "JOB-2038", name: "Escom Monthly SLA Report", stage: "failed", tone: "crit" as const, time: "04:12" },
];

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Network Operations Dashboard | MTL ANPMRS" },
      {
        name: "description",
        content:
          "Live MTL network operations dashboard: device availability, bandwidth utilisation, network health and active alerts.",
      },
      { property: "og:title", content: "Network Operations Dashboard | MTL ANPMRS" },
      {
        property: "og:description",
        content: "Real-time MTL network health, bandwidth utilisation and alert overview for NOC engineers.",
      },
    ],
  }),
  component: DashboardPage,
});

function DonutGauge({ value }: { value: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);
  return (
    <div className="relative h-24 w-24">
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
        <circle cx="40" cy="40" r={radius} className="fill-none stroke-secondary" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          className="fill-none stroke-status-ok"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-sm font-bold">{value}%</span>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  children,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  children?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={`panel p-5 ${highlight ? "border-mtl-yellow/60 bg-mtl-yellow/8" : ""}`}>
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
        <span className="grid h-8 w-8 place-items-center rounded-md bg-mtl-blue/10 text-mtl-blue">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-extrabold">{value}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function DashboardPage() {
  const online = devices.filter((d) => d.status === "online").length;

  return (
    <>
      <PageHeading
        title="Reporting Automation Dashboard"
        subtitle="Last report job completed 2 minutes ago · Screenshots sourced from SolarWinds & Observium"
        actions={
          <>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh jobs
            </Button>
            <Button size="sm">
              <FileText className="mr-2 h-4 w-4" /> Generate daily report
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Devices" value="850" icon={Server}>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <StatusDot tone="ok" /> 820 Online
            </span>
            <span className="flex items-center gap-1.5">
              <StatusDot tone="crit" /> 30 Offline
            </span>
          </div>
        </StatCard>

        <StatCard label="Network Availability" value="99.95%" icon={Gauge}>
          <div className="flex items-center gap-4">
            <DonutGauge value={99.95} />
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold text-status-ok">Above SLA target</p>
              <p>Target 99.50% · MTD</p>
            </div>
          </div>
        </StatCard>

        <StatCard label="Report Jobs (24h)" value="12" icon={Workflow} highlight>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="info" pulse>
              3 Processing
            </StatusBadge>
            <StatusBadge tone="ok">8 Completed</StatusBadge>
            <StatusBadge tone="crit">1 Failed</StatusBadge>
          </div>
        </StatCard>

        <StatCard label="Reports Generated" value="45" icon={FileText}>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowUpRight className="h-3.5 w-3.5 text-status-ok" /> 18 automated this week · 0 failures
          </p>
        </StatCard>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        <section className="panel p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">Network Health</h3>
              <p className="text-xs text-muted-foreground">Aggregated from Observium & SolarWinds polling groups</p>
            </div>
            <StatusBadge tone="warn" pulse>
              Warning
            </StatusBadge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {healthSegments.map((seg) => (
              <div key={seg.name} className="rounded-md border border-border bg-secondary/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{seg.name}</p>
                  <StatusDot tone={toneForStatus(seg.status)} pulse={seg.status !== "healthy"} />
                </div>
                <p className="mt-2 font-display text-xl font-bold">{seg.metric}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{seg.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">Bandwidth Utilisation Overview</h3>
              <p className="text-xs text-muted-foreground">
                Internet link 450 Mbps · Peak 90% · 00:00 – 24:00 (Mbps)
              </p>
            </div>
            <Activity className="h-4 w-4 text-mtl-blue" />
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficSeries} margin={{ left: -18, right: 6, top: 6 }}>
                <defs>
                  <linearGradient id="gBackbone" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gInternet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area
                  type="monotone"
                  dataKey="backbone"
                  name="Backbone"
                  stroke="var(--color-chart-1)"
                  fill="url(#gBackbone)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="internet"
                  name="Internet link"
                  stroke="var(--color-chart-2)"
                  fill="url(#gInternet)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="customer"
                  name="Customer links"
                  stroke="var(--color-chart-3)"
                  fill="transparent"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h3 className="text-base font-bold">Device Status</h3>
              <p className="text-xs text-muted-foreground">{online} of {devices.length} sampled devices online</p>
            </div>
            <Button variant="ghost" size="sm">
              View all devices
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-[11px] tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Device Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Location</th>
                  <th className="px-4 py-3 text-left font-semibold">IP Address</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">CPU</th>
                  <th className="px-4 py-3 text-left font-semibold">Memory</th>
                  <th className="px-5 py-3 text-left font-semibold">Last Checked</th>
                </tr>
              </thead>
              <tbody>
                {devices.slice(0, 8).map((d) => (
                  <tr key={d.hostname} className="border-t border-border hover:bg-secondary/50">
                    <td className="px-5 py-3 font-mono text-xs font-semibold">{d.hostname}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{d.location}</td>
                    <td className="px-4 py-3 font-mono text-xs">{d.ip}</td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={toneForStatus(d.status)} pulse={d.status === "offline"}>
                        {d.status}
                      </StatusBadge>
                    </td>
                    <td className="w-24 px-4 py-3">
                      <Progress value={d.cpu} className="h-1.5" />
                      <span className="text-[11px] text-muted-foreground">{d.cpu}%</span>
                    </td>
                    <td className="w-24 px-4 py-3">
                      <Progress value={d.memory} className="h-1.5" />
                      <span className="text-[11px] text-muted-foreground">{d.memory}%</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{d.lastChecked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel p-5">
          <h3 className="text-base font-bold">Recent Report Jobs</h3>
          <p className="text-xs text-muted-foreground">Background jobs processed by the reporting engine</p>
          <ul className="mt-4 space-y-3">
            {recentJobs.map((a) => (
              <li key={a.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge tone={a.tone} pulse={a.stage !== "completed" && a.stage !== "failed"}>
                    {a.stage}
                  </StatusBadge>
                  <span className="font-mono text-xs text-muted-foreground">{a.time}</span>
                </div>
                <p className="mt-2 text-sm font-semibold">{a.name}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{a.id}</p>
              </li>
            ))}
          </ul>
          <Button variant="outline" className="mt-4 w-full" size="sm">
            Open report jobs
          </Button>
        </section>
      </div>
    </>
  );
}
