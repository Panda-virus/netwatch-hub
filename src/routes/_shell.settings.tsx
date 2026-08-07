import { createFileRoute } from "@tanstack/react-router";
import { Bell, FileCog, Lock, Plug, Radio } from "lucide-react";

import { PageHeading } from "@/components/noc/PageHeading";
import { StatusBadge } from "@/components/noc/StatusDot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_shell/settings")({
  head: () => ({
    meta: [
      { title: "System Settings | MTL ANPMRS" },
      {
        name: "description",
        content:
          "Configure Observium and SolarWinds API connections, SNMP polling, report defaults, email notifications and security policy.",
      },
      { property: "og:title", content: "System Settings | MTL ANPMRS" },
      {
        property: "og:description",
        content: "Monitoring integrations, SNMP settings, report defaults and security policy for MTL ANPMRS.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <>
      <PageHeading
        title="System Settings"
        subtitle="Integration, automation and security configuration for the ANPMRS platform"
        actions={<Button size="sm">Save all changes</Button>}
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel icon={Plug} title="Monitoring Connections" desc="Data collection endpoints polled by the automation service">
          <Integration name="Observium API" url="https://observium.mtl.mw/api/v0" status="Connected" />
          <Integration name="SolarWinds API" url="https://solarwinds.mtl.mw:17778/SolarWinds/InformationService/v3" status="Connected" />
          <Integration name="SSH Collector (device configs)" url="ssh://collector.noc.mtl.mw" status="Connected" />
        </Panel>

        <Panel icon={Radio} title="SNMP Configuration" desc="Applied to newly discovered devices">
          <Row label="SNMP Version">
            <Input defaultValue="v3 (authPriv)" />
          </Row>
          <Row label="Polling Interval (seconds)">
            <Input type="number" defaultValue={60} />
          </Row>
          <Row label="Community / Context">
            <Input defaultValue="mtl-noc-ro" />
          </Row>
          <Row label="Timeout (ms)">
            <Input type="number" defaultValue={1500} />
          </Row>
        </Panel>

        <Panel icon={FileCog} title="Report Settings" desc="Defaults applied by the report scheduler">
          <Row label="Default Format">
            <Input defaultValue="PDF" />
          </Row>
          <Row label="Daily Report Time">
            <Input type="time" defaultValue="06:00" />
          </Row>
          <Toggle label="Attach raw metric CSV" defaultChecked={false} />
          <Toggle label="Include automated recommendations" defaultChecked />
          <Toggle label="Retain reports for 24 months (audit)" defaultChecked />
        </Panel>

        <Panel icon={Bell} title="Email Notification Settings" desc="Escalation and distribution lists">
          <Row label="SMTP Relay">
            <Input defaultValue="smtp.mtl.mw:587" />
          </Row>
          <Row label="Critical Alert Recipients">
            <Input defaultValue="noc-supervisors@mtl.mw" />
          </Row>
          <Row label="Management Report Recipients">
            <Input defaultValue="network-management@mtl.mw" />
          </Row>
          <Toggle label="SMS escalation for unacknowledged critical alerts" defaultChecked />
        </Panel>

        <Panel icon={Lock} title="Security Settings" desc="Access control and audit policy" className="xl:col-span-2">
          <div className="grid gap-4 md:grid-cols-2">
            <Row label="Session Timeout (minutes)">
              <Input type="number" defaultValue={30} />
            </Row>
            <Row label="Password Policy">
              <Input defaultValue="12+ chars, complexity, 90-day rotation" />
            </Row>
          </div>
          <Toggle label="Enforce two-factor authentication for administrators" defaultChecked />
          <Toggle label="Record all device SSH sessions to audit log" defaultChecked />
          <Toggle label="Restrict access to MTL corporate network ranges" defaultChecked />
        </Panel>
      </div>
    </>
  );
}

function Panel({
  icon: Icon,
  title,
  desc,
  children,
  className = "",
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel p-5 ${className}`}>
      <div className="flex items-start gap-3 border-b border-border pb-4">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-mtl-blue/10 text-mtl-blue">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-base font-bold">{title}</h3>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({ label, defaultChecked = false }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-secondary/60 px-4 py-3">
      <span className="text-sm">{label}</span>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

function Integration({ name, url, status }: { name: string; url: string; status: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{name}</p>
        <p className="truncate font-mono text-[11px] text-muted-foreground">{url}</p>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge tone="ok" pulse>
          {status}
        </StatusBadge>
        <Button variant="outline" size="sm">
          Test
        </Button>
      </div>
    </div>
  );
}
