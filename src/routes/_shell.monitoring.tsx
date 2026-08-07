import { createFileRoute } from "@tanstack/react-router";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeading } from "@/components/noc/PageHeading";
import { StatusBadge, StatusDot } from "@/components/noc/StatusDot";
import { latencySeries, trafficSeries } from "@/lib/noc-data";

export const Route = createFileRoute("/_shell/monitoring")({
  head: () => ({
    meta: [
      { title: "Live Network Monitoring | MTL ANPMRS" },
      {
        name: "description",
        content:
          "Live MTL network topology map with animated link states plus real-time traffic, latency and packet-loss graphs.",
      },
      { property: "og:title", content: "Live Network Monitoring | MTL ANPMRS" },
      {
        property: "og:description",
        content: "Animated MTL topology view with live traffic, latency and packet loss telemetry.",
      },
    ],
  }),
  component: MonitoringPage,
});

type NodeState = "ok" | "warn" | "crit";
const nodeFill: Record<NodeState, string> = {
  ok: "var(--color-status-ok)",
  warn: "var(--color-status-warn)",
  crit: "var(--color-status-crit)",
};

function TopologyMap() {
  const regional = [
    { x: 170, label: "BLANTYRE", state: "ok" as NodeState },
    { x: 430, label: "LILONGWE", state: "warn" as NodeState },
    { x: 690, label: "MZUZU", state: "crit" as NodeState },
  ];
  const customers = [
    { x: 110, label: "Limbe" },
    { x: 240, label: "Zomba" },
    { x: 370, label: "Kasungu" },
    { x: 500, label: "Salima" },
    { x: 630, label: "Karonga" },
    { x: 760, label: "Nkhata Bay" },
  ];

  return (
    <svg viewBox="0 0 860 420" className="h-[420px] w-full">
      <rect width="860" height="420" fill="transparent" />
      {regional.map((r) => (
        <line
          key={`core-${r.label}`}
          x1="430"
          y1="80"
          x2={r.x}
          y2="210"
          stroke={nodeFill[r.state]}
          strokeWidth="2.5"
          className="dash-flow"
          opacity="0.85"
        />
      ))}
      {customers.map((c, i) => {
        const parent = regional[Math.floor(i / 2)];
        return (
          <line
            key={`cust-${c.label}`}
            x1={parent.x}
            y1="210"
            x2={c.x}
            y2="340"
            stroke="var(--color-mtl-blue-light)"
            strokeWidth="1.6"
            className="dash-flow"
            opacity="0.5"
          />
        );
      })}

      <g>
        <rect x="350" y="52" width="160" height="52" rx="10" fill="var(--color-mtl-blue)" />
        <text x="430" y="74" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--color-mtl-blue-foreground)">
          MTL CORE NETWORK
        </text>
        <text x="430" y="92" textAnchor="middle" fontSize="10" fill="var(--color-mtl-yellow)">
          10 Gbps backbone · healthy
        </text>
      </g>

      {regional.map((r) => (
        <g key={r.label}>
          <rect
            x={r.x - 72}
            y="186"
            width="144"
            height="48"
            rx="10"
            fill="var(--color-card)"
            stroke={nodeFill[r.state]}
            strokeWidth="2"
          />
          <circle cx={r.x - 54} cy="210" r="5" fill={nodeFill[r.state]} />
          <text x={r.x + 8} y="206" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-foreground)">
            {r.label}
          </text>
          <text x={r.x + 8} y="222" textAnchor="middle" fontSize="9" fill="var(--color-muted-foreground)">
            Regional node
          </text>
        </g>
      ))}

      {customers.map((c) => (
        <g key={c.label}>
          <rect
            x={c.x - 46}
            y="322"
            width="92"
            height="36"
            rx="8"
            fill="var(--color-secondary)"
            stroke="var(--color-border)"
          />
          <circle cx={c.x - 32} cy="340" r="4" fill="var(--color-status-ok)" />
          <text x={c.x + 6} y="344" textAnchor="middle" fontSize="10" fill="var(--color-foreground)">
            {c.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function MonitoringPage() {
  return (
    <>
      <PageHeading
        title="Live Network Monitoring"
        subtitle="SNMP polling interval 60s · SSH reachability probes 300s"
        actions={
          <StatusBadge tone="ok" pulse>
            Live feed active
          </StatusBadge>
        }
      />

      <section className="panel grid-backdrop overflow-hidden p-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold">Network Topology Map</h3>
            <p className="text-xs text-muted-foreground">Core → Regional nodes → Customer connections</p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <StatusDot tone="ok" /> Normal
            </span>
            <span className="flex items-center gap-1.5">
              <StatusDot tone="warn" pulse /> Warning
            </span>
            <span className="flex items-center gap-1.5">
              <StatusDot tone="crit" pulse /> Failure
            </span>
          </div>
        </div>
        <TopologyMap />
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <ChartPanel title="Live Traffic" subtitle="Mbps · last 24h">
          <LineChart data={trafficSeries} margin={{ left: -20, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" />
            <YAxis tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid var(--color-border)" }} />
            <Line type="monotone" dataKey="backbone" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="internet" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartPanel>

        <ChartPanel title="Latency" subtitle="ms · Blantyre ↔ Lilongwe">
          <LineChart data={latencySeries} margin={{ left: -20, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" />
            <YAxis tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid var(--color-border)" }} />
            <Line type="monotone" dataKey="latency" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartPanel>

        <ChartPanel title="Packet Loss" subtitle="% · aggregated edge probes">
          <LineChart data={latencySeries} margin={{ left: -20, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" />
            <YAxis tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid var(--color-border)" }} />
            <Line type="monotone" dataKey="loss" stroke="var(--color-chart-5)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartPanel>
      </div>
    </>
  );
}

function ChartPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactElement;
}) {
  return (
    <section className="panel p-5">
      <h3 className="text-sm font-bold">{title}</h3>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
      <div className="mt-3 h-52">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </section>
  );
}
