import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, UserPlus } from "lucide-react";

import { PageHeading } from "@/components/noc/PageHeading";
import { StatusBadge, toneForStatus } from "@/components/noc/StatusDot";
import { Button } from "@/components/ui/button";
import { users } from "@/lib/noc-data";

export const Route = createFileRoute("/_shell/users")({
  head: () => ({
    meta: [
      { title: "User Management | MTL ANPMRS" },
      {
        name: "description",
        content:
          "Administer MTL NOC accounts and roles: Administrator, NOC Supervisor and NOC Engineer with regional scope.",
      },
      { property: "og:title", content: "User Management | MTL ANPMRS" },
      {
        property: "og:description",
        content: "MTL NOC user accounts, roles, regions and last login audit trail.",
      },
    ],
  }),
  component: UsersPage,
});

const roleCards = [
  { role: "Administrator", count: 1, detail: "Full system access, template and integration control" },
  { role: "NOC Supervisor", count: 2, detail: "Alert assignment, report approval, regional oversight" },
  { role: "NOC Engineer", count: 3, detail: "Monitoring, acknowledgement and incident documentation" },
];

function UsersPage() {
  return (
    <>
      <PageHeading
        title="User Management"
        subtitle="Role-based access control with regional scoping · All actions written to the audit log"
        actions={
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" /> Add user
          </Button>
        }
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        {roleCards.map((r) => (
          <div key={r.role} className="panel p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">{r.role}</p>
              <ShieldCheck className="h-4 w-4 text-mtl-blue" />
            </div>
            <p className="mt-2 font-display text-3xl font-extrabold">{r.count}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{r.detail}</p>
          </div>
        ))}
      </div>

      <section className="panel overflow-hidden">
        <div className="border-b border-border p-5">
          <h3 className="text-base font-bold">NOC Accounts</h3>
          <p className="text-xs text-muted-foreground">{users.length} accounts provisioned</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-[11px] tracking-wider text-muted-foreground uppercase">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Role</th>
                <th className="px-4 py-3 text-left font-semibold">Region</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Last Login</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.name} className="border-t border-border hover:bg-secondary/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-mtl-blue text-[11px] font-bold text-mtl-blue-foreground">
                        {u.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                      <span className="font-semibold">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold">{u.role}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.region}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={toneForStatus(u.status)}>{u.status}</StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.lastLogin}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        Edit role
                      </Button>
                      <Button variant="ghost" size="sm">
                        Reset password
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
