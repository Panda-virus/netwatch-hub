import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Lock, Trash2, UserPlus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/auth";
import type { AppUserRow } from "@/lib/platform-types";
import {
  deleteUser,
  listIntegrations,
  listUsers,
  saveUser,
  setUserStatus,
} from "@/lib/platform.functions";

export const Route = createFileRoute("/_shell/admin/users")({
  head: () => ({
    meta: [
      { title: "Manage Users | MTL Report Platform Administration" },
      {
        name: "description",
        content:
          "Create, suspend and assign integrations for MTL report platform accounts: NOC engineers, supervisors and system administrators.",
      },
      { property: "og:title", content: "Manage Users | MTL Report Platform Administration" },
      { property: "og:description", content: "Administer MTL report platform user accounts and their roles." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminUsersPage,
});

type FormState = { id?: string; name: string; email: string; role: string; integration: string };

const EMPTY: FormState = { name: "", email: "", role: "NOC Engineer", integration: "None assigned" };

function AdminUsersPage() {
  const session = useSession();
  const actor = session?.email ?? "unknown";
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery({ queryKey: ["users"], queryFn: () => listUsers() });
  const { data: integrations = [] } = useQuery({ queryKey: ["integrations"], queryFn: () => listIntegrations() });
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  function openEditor(user?: AppUserRow) {
    setForm(
      user
        ? { id: user.id, name: user.name, email: user.email, role: user.role, integration: user.integration }
        : { ...EMPTY },
    );
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    try {
      await saveUser({ data: { ...form, actor } });
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`${form.email} saved.`);
      setForm(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the account.");
    } finally {
      setSaving(false);
    }
  }

  const integrationOptions = [
    "None assigned",
    "All integrations",
    ...integrations.map((i) => i.name),
  ];

  return (
    <>
      <PageHeading
        title="Manage Users"
        subtitle="Accounts that can upload templates, run report creation and download finished documents"
        actions={
          <Button size="sm" onClick={() => openEditor()}>
            <UserPlus className="mr-2 h-4 w-4" /> Add user
          </Button>
        }
      />

      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-[11px] tracking-wider text-muted-foreground uppercase">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Role</th>
                <th className="px-4 py-3 text-left font-semibold">Integration</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Last login</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-sm text-muted-foreground">
                    Loading accounts…
                  </td>
                </tr>
              ) : null}
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-secondary/50">
                  <td className="px-5 py-3">
                    <p className="flex items-center gap-2 font-semibold">
                      {u.name}
                      {u.is_protected ? <Lock className="h-3.5 w-3.5 text-mtl-blue" /> : null}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">{u.role}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.integration}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={u.status === "Active" ? "ok" : "warn"}>{u.status}</StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : "never"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex flex-wrap justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditor(u)}>
                        Edit / integration
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={u.is_protected}
                        onClick={async () => {
                          try {
                            const next = u.status === "Active" ? "Suspended" : "Active";
                            await setUserStatus({ data: { id: u.id, status: next, actor } });
                            await queryClient.invalidateQueries({ queryKey: ["users"] });
                            toast.success(`${u.email} is now ${next.toLowerCase()}.`);
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : "Action failed.");
                          }
                        }}
                      >
                        {u.status === "Active" ? "Suspend" : "Reactivate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={u.is_protected}
                        onClick={async () => {
                          try {
                            await deleteUser({ data: { id: u.id, actor } });
                            await queryClient.invalidateQueries({ queryKey: ["users"] });
                            toast.success(`${u.email} deleted.`);
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : "Action failed.");
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {u.is_protected ? (
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        The system administrator cannot be suspended or deleted
                      </p>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={form !== null} onOpenChange={(open) => !open && setForm(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form?.id ? "Edit account" : "Add user"}</DialogTitle>
            <DialogDescription>
              Assign the role and which graph source integration this person may use when running reports.
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
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Full name
                </Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Email
                </Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Role
                </Label>
                <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOC Engineer">NOC Engineer</SelectItem>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                    <SelectItem value="System Administrator">System Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Integration
                </Label>
                <Select value={form.integration} onValueChange={(value) => setForm({ ...form, integration: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {integrationOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
