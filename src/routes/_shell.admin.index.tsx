import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plug, ScrollText, ShieldCheck, Users } from "lucide-react";

import { PageHeading } from "@/components/noc/PageHeading";
import { StatusBadge } from "@/components/noc/StatusDot";
import { Button } from "@/components/ui/button";
import { getOverview, listUsers } from "@/lib/platform.functions";

export const Route = createFileRoute("/_shell/admin/")({
  head: () => ({
    meta: [
      { title: "System Administrator Dashboard | MTL Report Platform" },
      {
        name: "description",
        content:
          "Administrator dashboard for the MTL report platform: user accounts, activity logs, integrations and security posture.",
      },
      { property: "og:title", content: "System Administrator Dashboard | MTL Report Platform" },
      {
        property: "og:description",
        content: "Manage MTL report platform users, integrations, security and audit activity.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: overview } = useQuery({ queryKey: ["overview"], queryFn: () => getOverview() });
  const { data: systemUsers = [] } = useQuery({ queryKey: ["users"], queryFn: () => listUsers() });
  const activityLogs = overview?.recentLogs ?? [];
  const integrations = overview?.integrations ?? [];
  const activeUsers = systemUsers.filter((u) => u.status === "Active").length;
  const failures = activityLogs.filter((l) => l.result === "failure").length;
  const healthy = integrations.filter((i) => i.status === "connected").length;

  return (
    <>
      <PageHeading
        title="System Administrator Dashboard"
        subtitle="Users, activity logs, integrations and security for the MTL report creation platform"
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/logs">
                <ScrollText className="mr-2 h-4 w-4" /> View activity log
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/admin/users">
                <Users className="mr-2 h-4 w-4" /> Manage users
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Tile to="/admin/users" label="Users in system" value={String(systemUsers.length)} icon={Users}>
          {activeUsers} active · {systemUsers.length - activeUsers} suspended
        </Tile>
        <Tile to="/admin/logs" label="Recent events" value={String(activityLogs.length)} icon={ScrollText}>
          {failures} failed action{failures === 1 ? "" : "s"} recorded
        </Tile>
        <Tile to="/admin/integrations" label="Integrations" value={`${healthy}/${integrations.length}`} icon={Plug}>
          {integrations.length - healthy} not confirmed reachable
        </Tile>
        <Tile to="/admin/security" label="Security posture" value="Good" icon={ShieldCheck}>
          Credentials encrypted · MFA pending rollout
        </Tile>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h3 className="text-base font-bold">Recent user activity</h3>
              <p className="text-xs text-muted-foreground">Every sign-in, upload and report action is recorded</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/logs">Full log</Link>
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {activityLogs.slice(0, 6).map((l) => (
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

        <section className="panel p-5">
          <h3 className="text-base font-bold">Users in the system</h3>
          <p className="text-xs text-muted-foreground">Report activity per account</p>
          <ul className="mt-4 space-y-3">
            {systemUsers.map((u) => (
              <li key={u.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{u.name}</p>
                  <StatusBadge tone={u.status === "Active" ? "ok" : "warn"}>{u.status}</StatusBadge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {u.email} · {u.role}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {u.integration} · last login{" "}
                  {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : "never"}
                </p>
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" size="sm" className="mt-4 w-full">
            <Link to="/admin/users">Open user management</Link>
          </Button>
        </section>
      </div>
    </>
  );
}

function Tile({
  to,
  label,
  value,
  icon: Icon,
  children,
}: {
  to: string;
  label: string;
  value: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Link to={to} className="panel block p-5 transition-colors hover:border-mtl-blue/50">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
        <span className="grid h-8 w-8 place-items-center rounded-md bg-mtl-blue/10 text-mtl-blue">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-extrabold">{value}</p>
      <p className="mt-3 text-xs text-muted-foreground">{children}</p>
    </Link>
  );
}