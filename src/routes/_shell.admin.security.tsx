import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { PageHeading } from "@/components/noc/PageHeading";
import { StatusBadge } from "@/components/noc/StatusDot";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { activityLogs } from "@/lib/report-data";

export const Route = createFileRoute("/_shell/admin/security")({
  head: () => ({
    meta: [
      { title: "Security | MTL Report Platform Administration" },
      {
        name: "description",
        content:
          "Security controls for the MTL report platform: password policy, session limits, credential encryption and failed sign-in review.",
      },
      { property: "og:title", content: "Security | MTL Report Platform Administration" },
      {
        property: "og:description",
        content: "Password policy, session controls and credential encryption for the MTL report platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminSecurityPage,
});

const policies = [
  { label: "Enforce strong passwords", detail: "12+ characters, mixed case, number and symbol", on: true },
  { label: "Require MFA for administrators", detail: "Authenticator app on every administrator sign-in", on: false },
  { label: "Lock account after 5 failed attempts", detail: "Automatic 30 minute lockout", on: true },
  { label: "Encrypt integration credentials at rest", detail: "Fernet encryption, keys held server-side only", on: true },
  { label: "Expire sessions after 8 hours", detail: "Idle workstations are signed out automatically", on: true },
  { label: "Retain audit log for 24 months", detail: "Required for management and SLA audits", on: true },
];

function AdminSecurityPage() {
  const failures = activityLogs.filter((l) => l.result === "failure");

  return (
    <>
      <PageHeading
        title="Security"
        subtitle="Access policies and credential protection for the report creation platform"
        actions={
          <Button size="sm" onClick={() => toast.success("Security policy saved")}>
            <ShieldCheck className="mr-2 h-4 w-4" /> Save policy
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <section className="panel p-5">
          <h3 className="flex items-center gap-2 text-base font-bold">
            <Lock className="h-4 w-4 text-mtl-blue" /> Access policies
          </h3>
          <ul className="mt-4 space-y-3">
            {policies.map((p) => (
              <li key={p.label} className="flex items-start justify-between gap-4 rounded-md border border-border bg-secondary/50 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{p.label}</p>
                  <p className="text-[11px] text-muted-foreground">{p.detail}</p>
                </div>
                <Switch
                  defaultChecked={p.on}
                  onCheckedChange={(v) => toast.success(`${p.label} ${v ? "enabled" : "disabled"}`)}
                />
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-5">
          <section className="panel p-5">
            <h3 className="flex items-center gap-2 text-base font-bold">
              <KeyRound className="h-4 w-4 text-mtl-blue" /> Credential protection
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Integration credentials are encrypted at rest and never shown again after saving.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.success("Encryption key rotation scheduled")}>
                Rotate encryption key
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.success("All active sessions revoked")}>
                Revoke all sessions
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/integrations">Review integrations</Link>
              </Button>
            </div>
          </section>

          <section className="panel p-5">
            <h3 className="text-base font-bold">Failed and sensitive actions</h3>
            <p className="text-xs text-muted-foreground">Pulled from the activity log</p>
            <ul className="mt-4 space-y-3">
              {failures.map((f) => (
                <li key={`${f.time}-${f.action}`} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge tone="crit">{f.result}</StatusBadge>
                    <span className="text-xs text-muted-foreground">{f.time}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{f.action}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {f.actor} · {f.resource} · {f.ip}
                  </p>
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" size="sm" className="mt-4 w-full">
              <Link to="/admin/logs">Open full activity log</Link>
            </Button>
          </section>
        </div>
      </div>
    </>
  );
}