import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeading } from "@/components/noc/PageHeading";
import { StatusBadge } from "@/components/noc/StatusDot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { activityLogs } from "@/lib/report-data";

export const Route = createFileRoute("/_shell/admin/logs")({
  head: () => ({
    meta: [
      { title: "User Logs & Activity | MTL Report Platform Administration" },
      {
        name: "description",
        content:
          "Audit trail of MTL report platform activity: sign-ins, template uploads, report runs, downloads and credential changes.",
      },
      { property: "og:title", content: "User Logs & Activity | MTL Report Platform Administration" },
      {
        property: "og:description",
        content: "Searchable audit trail of every user action on the MTL report platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminLogsPage,
});

function AdminLogsPage() {
  const [query, setQuery] = useState("");
  const rows = activityLogs.filter((l) =>
    `${l.actor} ${l.action} ${l.resource}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <PageHeading
        title="User Logs & Activity"
        subtitle="Retained 24 months · every sign-in, upload, report run and download"
        actions={
          <Button size="sm" variant="outline" onClick={() => toast.success("Activity log exported as CSV")}>
            <Download className="mr-2 h-4 w-4" /> Export log
          </Button>
        }
      />

      <div className="panel p-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by user, action or resource…"
          className="bg-secondary"
        />
      </div>

      <section className="panel mt-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-[11px] tracking-wider text-muted-foreground uppercase">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Time</th>
                <th className="px-4 py-3 text-left font-semibold">User</th>
                <th className="px-4 py-3 text-left font-semibold">Action</th>
                <th className="px-4 py-3 text-left font-semibold">Resource</th>
                <th className="px-4 py-3 text-left font-semibold">Result</th>
                <th className="px-5 py-3 text-left font-semibold">IP address</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={`${l.time}-${l.action}-${l.resource}`} className="border-t border-border hover:bg-secondary/50">
                  <td className="px-5 py-3 text-xs text-muted-foreground">{l.time}</td>
                  <td className="px-4 py-3 font-mono text-xs">{l.actor}</td>
                  <td className="px-4 py-3 text-xs font-semibold">{l.action}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{l.resource}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={l.result === "success" ? "ok" : "crit"}>{l.result}</StatusBadge>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{l.ip}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-xs text-muted-foreground">
                    No activity matches that filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-5">
        <Button asChild variant="outline">
          <Link to="/admin">Back to admin dashboard</Link>
        </Button>
      </div>
    </>
  );
}