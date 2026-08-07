import { createFileRoute } from "@tanstack/react-router";
import { Lightbulb, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeading } from "@/components/noc/PageHeading";
import { Progress } from "@/components/ui/progress";
import { availabilityTrend, bandwidthGrowth, topLinks } from "@/lib/noc-data";

export const Route = createFileRoute("/_shell/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics & Performance Trends | MTL ANPMRS" },
      {
        name: "description",
        content:
          "MTL bandwidth growth trends, regional availability history, top utilised links and automated capacity recommendations.",
      },
      { property: "og:title", content: "Analytics & Performance Trends | MTL ANPMRS" },
      {
        property: "og:description",
        content: "Historical MTL network trends with automated capacity and remediation recommendations.",
      },
    ],
  }),
  component: AnalyticsPage,
});

const recommendations = [
  "Blantyre Internet Link sustained 90% peak utilisation for 12 days — schedule upgrade from 5 Gbps to 10 Gbps within the next quarter.",
  "Mzuzu core router has 3 unplanned outages this month — raise a field maintenance task and review power redundancy.",
  "Lilongwe DC server 07 memory trend is rising 4% per week — plan resource reallocation before month end.",
];

function AnalyticsPage() {
  return (
    <>
      <PageHeading
        title="Analytics & Performance Trends"
        subtitle="Historical analysis window: last 8 months · Source: consolidated polling archive"
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="panel p-5">
          <h3 className="text-base font-bold">Bandwidth Growth Trend</h3>
          <p className="text-xs text-muted-foreground">Peak vs average aggregate throughput (Gbps)</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bandwidthGrowth} margin={{ left: -18, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid var(--color-border)" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="peak" name="Peak" stroke="var(--color-chart-1)" strokeWidth={2.5} />
                <Line
                  type="monotone"
                  dataKey="average"
                  name="Average"
                  stroke="var(--color-chart-3)"
                  strokeWidth={2.5}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-5">
          <h3 className="text-base font-bold">Device Availability Trend</h3>
          <p className="text-xs text-muted-foreground">Monthly availability by region (%)</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={availabilityTrend} margin={{ left: -18, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <YAxis domain={[99.4, 100]} tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid var(--color-border)" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="south" name="South" fill="var(--color-chart-1)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="central" name="Central" fill="var(--color-chart-2)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="north" name="North" fill="var(--color-chart-3)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <section className="panel p-5">
          <h3 className="flex items-center gap-2 text-base font-bold">
            <TrendingUp className="h-4 w-4 text-mtl-blue" /> Top Utilised Links
          </h3>
          <ol className="mt-4 space-y-4">
            {topLinks.map((l, i) => (
              <li key={l.name}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-secondary text-[11px] font-bold">
                      {i + 1}
                    </span>
                    <span className="truncate font-semibold">{l.name}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{l.capacity}</span>
                  </span>
                  <span className="font-display font-bold">{l.utilisation}%</span>
                </div>
                <Progress value={l.utilisation} className="h-2" />
              </li>
            ))}
          </ol>
        </section>

        <section className="panel border-mtl-yellow/60 bg-mtl-yellow/8 p-5">
          <h3 className="flex items-center gap-2 text-base font-bold">
            <Lightbulb className="h-4 w-4" /> Automated Recommendations
          </h3>
          <p className="text-xs text-muted-foreground">Generated from trend analysis and threshold breach frequency</p>
          <ul className="mt-4 space-y-3">
            {recommendations.map((r) => (
              <li key={r} className="rounded-md border border-border bg-card p-4 text-sm leading-relaxed">
                {r}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
