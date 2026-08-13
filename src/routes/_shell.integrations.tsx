import { createFileRoute, Link } from "@tanstack/react-router";
import { Plug, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeading } from "@/components/noc/PageHeading";
import { StatusBadge } from "@/components/noc/StatusDot";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { integrations } from "@/lib/report-data";

export const Route = createFileRoute("/_shell/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations | MTL Report Platform" },
      {
        name: "description",
        content:
          "NOC engineer view of MTL report platform integrations: graph sources used for daily screenshot capture and report generation.",
      },
      { property: "og:title", content: "Integrations | MTL Report Platform" },
      {
        property: "og:description",
        content: "Test and update the graph source connections used to build MTL infrastructure reports.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const [editing, setEditing] = useState<(typeof integrations)[number] | null>(null);
  const [form, setForm] = useState({ name: "", kind: "", url: "", owner: "", username: "", password: "" });

  function openEditor(i: (typeof integrations)[number]) {
    setEditing(i);
    setForm({ name: i.name, kind: i.kind, url: i.url, owner: "", username: "", password: "" });
  }

  return (
    <>
      <PageHeading
        title="Integrations"
        subtitle="Graph sources this platform signs into when capturing screenshots for your reports"
        actions={
          <Button size="sm" onClick={() => toast.success("New integration request sent to administrator")}>
            <Plug className="mr-2 h-4 w-4" /> Request integration
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
              <Button size="sm" variant="outline" onClick={() => openEditor(i)}>
                Update connection
              </Button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/templates">Report templates</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit connection</DialogTitle>
            <DialogDescription>
              Update the connection details and the sign-in credentials used to reach this graph source.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success(`${form.name} updated — credentials stored encrypted at rest`);
              setEditing(null);
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Connection name">
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </FormField>
              <FormField label="Type">
                <Input value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} required />
              </FormField>
            </div>
            <FormField label="URL">
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
            </FormField>
            <FormField label="Credential owner (person)">
              <Input
                placeholder="e.g. christasia@mtl.com"
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
                required
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Login username">
                <Input
                  autoComplete="off"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="Login password">
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </FormField>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{label}</Label>
      {children}
    </div>
  );
}