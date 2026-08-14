import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plug, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
import { useSession } from "@/lib/auth";
import type { IntegrationRow } from "@/lib/platform-types";
import {
  deleteIntegration,
  listIntegrations,
  saveIntegration,
  testIntegration,
} from "@/lib/platform.functions";

type FormState = {
  id?: string;
  name: string;
  kind: string;
  base_url: string;
  owner_email: string;
  login_username: string;
  login_password: string;
};

const EMPTY: FormState = {
  name: "",
  kind: "Graph source",
  base_url: "https://",
  owner_email: "",
  login_username: "",
  login_password: "",
};

function tone(status: string) {
  if (status === "connected") return "ok" as const;
  if (status === "degraded") return "warn" as const;
  if (status === "disconnected") return "crit" as const;
  return "info" as const;
}

export function IntegrationsManager({ canDelete }: { canDelete: boolean }) {
  const session = useSession();
  const actor = session?.email ?? "unknown";
  const queryClient = useQueryClient();
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["integrations"], queryFn: () => listIntegrations() });

  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  function openEditor(row?: IntegrationRow) {
    setForm(
      row
        ? {
            id: row.id,
            name: row.name,
            kind: row.kind,
            base_url: row.base_url,
            owner_email: row.owner_email ?? "",
            login_username: row.login_username ?? "",
            login_password: "",
          }
        : { ...EMPTY },
    );
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    try {
      await saveIntegration({ data: { ...form, actor } });
      await queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast.success(`${form.name} saved — the connection now uses these details.`);
      setForm(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the connection.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTest(row: IntegrationRow) {
    setTesting(row.id);
    try {
      const result = await testIntegration({ data: { id: row.id, actor } });
      await queryClient.invalidateQueries({ queryKey: ["integrations"] });
      if (result.ok) toast.success(`Connection successful — ${result.message}`);
      else toast.error(`Connection failed — ${result.message}`, { duration: 9000 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The test could not be run.");
    } finally {
      setTesting(null);
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => openEditor()}>
          <Plug className="mr-2 h-4 w-4" /> Add integration
        </Button>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading connections…</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map((i) => (
          <article key={i.id} className="panel p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-bold">{i.name}</h3>
                <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">{i.kind}</p>
                <p className="mt-2 font-mono text-xs break-all text-muted-foreground">{i.base_url}</p>
              </div>
              <StatusBadge tone={tone(i.status)} pulse={i.status !== "connected"}>
                {i.status}
              </StatusBadge>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Sign-in user: {i.login_username ?? "not set"} · password {i.has_password ? "stored" : "not set"}
              {i.owner_email ? ` · owner ${i.owner_email}` : ""}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Last checked {i.last_checked_at ? new Date(i.last_checked_at).toLocaleString() : "never"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" disabled={testing === i.id} onClick={() => handleTest(i)}>
                <RefreshCw className={`mr-2 h-3.5 w-3.5 ${testing === i.id ? "animate-spin" : ""}`} />
                {testing === i.id ? "Pinging…" : "Test connection"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => openEditor(i)}>
                Update connection
              </Button>
              {canDelete ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await deleteIntegration({ data: { id: i.id, actor } });
                    await queryClient.invalidateQueries({ queryKey: ["integrations"] });
                    toast.success(`${i.name} removed`);
                  }}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Remove
                </Button>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <Dialog open={form !== null} onOpenChange={(open) => !open && setForm(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form?.id ? "Edit connection" : "Add connection"}</DialogTitle>
            <DialogDescription>
              Saved details overwrite the previous ones and are used when the platform signs in to capture graphs.
            </DialogDescription>
          </DialogHeader>

          {form ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSave();
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Connection name">
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </Field>
                <Field label="Type">
                  <Input value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} required />
                </Field>
              </div>
              <Field label="URL">
                <Input
                  type="url"
                  value={form.base_url}
                  onChange={(e) => setForm({ ...form, base_url: e.target.value })}
                  required
                />
              </Field>
              <Field label="Credential owner (person)">
                <Input
                  placeholder="e.g. christasia@mtl.com"
                  value={form.owner_email}
                  onChange={(e) => setForm({ ...form, owner_email: e.target.value })}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Login username">
                  <Input
                    autoComplete="off"
                    value={form.login_username}
                    onChange={(e) => setForm({ ...form, login_username: e.target.value })}
                  />
                </Field>
                <Field label={form.id ? "Login password (blank keeps current)" : "Login password"}>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={form.login_password}
                    onChange={(e) => setForm({ ...form, login_password: e.target.value })}
                  />
                </Field>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setForm(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{label}</Label>
      {children}
    </div>
  );
}