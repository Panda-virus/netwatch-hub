import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Cpu, HardDrive, Network, Search, Server, Shield, Wifi } from "lucide-react";

import { PageHeading } from "@/components/noc/PageHeading";
import { StatusBadge, toneForStatus } from "@/components/noc/StatusDot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { devices } from "@/lib/noc-data";

export const Route = createFileRoute("/_shell/devices")({
  head: () => ({
    meta: [
      { title: "Network Devices Inventory | MTL ANPMRS" },
      {
        name: "description",
        content:
          "Search and filter MTL routers, switches, firewalls and servers by region with live CPU, memory and bandwidth metrics.",
      },
      { property: "og:title", content: "Network Devices Inventory | MTL ANPMRS" },
      {
        property: "og:description",
        content: "MTL device inventory with per-device health, region filters and polling source.",
      },
    ],
  }),
  component: DevicesPage,
});

const regions = ["All", "South", "Central", "North"] as const;
const types = ["All", "Router", "Switch", "Firewall", "Server"] as const;

const typeIcon: Record<string, React.ElementType> = {
  Router: Network,
  Switch: Wifi,
  Firewall: Shield,
  Server: Server,
};

function DevicesPage() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<(typeof regions)[number]>("All");
  const [type, setType] = useState<(typeof types)[number]>("All");

  const filtered = useMemo(
    () =>
      devices.filter(
        (d) =>
          (region === "All" || d.region === region) &&
          (type === "All" || d.type === type) &&
          (d.hostname.toLowerCase().includes(query.toLowerCase()) || d.ip.includes(query)),
      ),
    [query, region, type],
  );

  return (
    <>
      <PageHeading
        title="Network Devices"
        subtitle={`${filtered.length} of ${devices.length} devices matching current filters · Auto-discovered via Observium & SolarWinds`}
        actions={<Button size="sm">Add device to inventory</Button>}
      />

      <div className="panel mb-5 p-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search device by hostname/IP"
            className="bg-secondary pl-9"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-6">
          <FilterRow label="Region" options={regions} value={region} onChange={setRegion} />
          <FilterRow label="Device Type" options={types} value={type} onChange={setType} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((d) => {
          const Icon = typeIcon[d.type] ?? Server;
          return (
            <article key={d.hostname} className="panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-mtl-blue/10 text-mtl-blue">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-mono text-sm font-bold">{d.hostname}</h3>
                    <p className="text-xs text-muted-foreground">
                      {d.type} · {d.location}
                    </p>
                  </div>
                </div>
                <StatusBadge tone={toneForStatus(d.status)} pulse={d.status === "offline"}>
                  {d.status}
                </StatusBadge>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="text-muted-foreground">IP Address</dt>
                  <dd className="font-mono font-semibold">{d.ip}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Region</dt>
                  <dd className="font-semibold">{d.region}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Bandwidth</dt>
                  <dd className="font-semibold">{d.bandwidth}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Polled by</dt>
                  <dd className="font-semibold">{d.source}</dd>
                </div>
              </dl>

              <div className="mt-4 space-y-3">
                <Metric icon={Cpu} label="CPU" value={d.cpu} />
                <Metric icon={HardDrive} label="Memory" value={d.memory} />
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Interfaces
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  SSH audit log
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function FilterRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              value === o
                ? "border-mtl-blue bg-mtl-blue text-mtl-blue-foreground"
                : "border-border bg-card text-muted-foreground hover:border-mtl-blue/40"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="h-3.5 w-3.5" /> {label}
        </span>
        <span className="font-semibold">{value}%</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}
