import { createFileRoute, Link } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

import { PageHeading } from "@/components/noc/PageHeading";
import { StatusBadge } from "@/components/noc/StatusDot";
import { Button } from "@/components/ui/button";
import { systemUsers } from "@/lib/report-data";

export const Route = createFileRoute("/_shell/admin/users")({
  head: () => ({
    meta: [
      { title: "Manage Users | MTL Report Platform Administration" },
      {
        name: "description",
        content:
          "Create, suspend and assign roles for MTL report platform accounts: NOC engineers, supervisors and system administrators.",
      },
      { property: "og:title", content: "Manage Users | MTL Report Platform Administration" },
      {
        property: "og:description",
        content: "Administer MTL report platform user accounts and their roles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  return (
    <>
      <PageHeading
        title="Manage Users"
        subtitle="Accounts that can upload templates, run report creation and download finished documents"
        actions={
          <Button size="sm" onClick={() => toast.success("Invitation form opened — new account will receive a set-password email")}>
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
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Role</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Reports</th>
                <th className="px-4 py-3 text-left font-semibold">Last login</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {systemUsers.map((u) => (
                <tr key={u.email} className="border-t border-border hover:bg-secondary/50">
                  <td className="px-5 py-3 font-semibold">{u.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{u.email}</td>
                  <td className="px-4 py-3 text-xs">{u.role}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={u.status === "Active" ? "ok" : "warn"}>{u.status}</StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-xs">{u.reports}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.lastLogin}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex flex-wrap justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => toast.info(`Editing ${u.name}`)}>
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.success(`Password reset link sent to ${u.email}`)}
                      >
                        Reset password
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toast.success(
                            u.status === "Active" ? `${u.name} suspended` : `${u.name} reactivated`,
                          )
                        }
                      >
                        {u.status === "Active" ? "Suspend" : "Reactivate"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/admin/logs">See what these users did</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/admin/security">Security policies</Link>
        </Button>
      </div>
    </>
  );
}