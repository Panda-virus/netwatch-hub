import { createFileRoute, Link } from "@tanstack/react-router";
import { Plug, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { PageHeading } from "@/components/noc/PageHeading";
import { StatusBadge } from "@/components/noc/StatusDot";
import { Button } from "@/components/ui/button";
import { integrations } from "@/lib/report-data";

export const Route = createFileRoute("/_shell/admin/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations | MTL Report Platform Administration" },
      {
        name: "description",
        content:
          "Manage MTL report platform integrations: graph sources used for screenshots, report delivery and document archive storage.",
      },
      { property: "og:title", content: "Integrations | MTL Report Platform Administration" },
      {
        property: "og:description",
        content: "Connect, test and rotate credentials for MTL report platform integrations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminIntegrationsPage,
});

function AdminIntegrationsPage() {
  return (
    <>
      <PageHeading
        title="Integrations"
        subtitle="Sources the platform reads graphs from, plus report delivery and archive destinations"
        actions={
          <Button size="sm" onClick={() => toast.success("New integration form opened")}>
            <Plug className="mr-2 h-4 w-4" /> Add integration
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {integrations.map((i) => (
          <article key={i.name} className="panel p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-bold">{i.name}</h3>
                <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">{i.kind}</p>
                <p className="mt-2 font-mono text-xs text-muted-foreground">{i.url}</p>
              </div>
              <StatusBadge
                tone={i.status === "connected" ? "ok" : i.status === "degraded" ? "warn" : "crit"}
                pulse={i.status !== "connected"}
              >
                {i.status}
              </StatusBadge>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{i.detail}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Last used {i.lastUsed}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => toast.info(`Testing connection to ${i.name}…`)}>
                <RefreshCw className="mr-2 h-3.5 w-3.5" /> Test connection
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.success(`Credentials updated for ${i.name}`)}>
                Update credentials
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  toast.success(i.status === "disconnected" ? `${i.name} reconnected` : `${i.name} disconnected`)
                }
              >
                {i.status === "disconnected" ? "Reconnect" : "Disconnect"}
              </Button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/admin/security">Security policies</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/admin">Back to admin dashboard</Link>
        </Button>
      </div>
    </>
  );
}