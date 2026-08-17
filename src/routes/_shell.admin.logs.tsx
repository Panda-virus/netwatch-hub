import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";

import { PageHeading } from "@/components/noc/PageHeading";
import { StatusBadge } from "@/components/noc/StatusDot";
import { Button } from "@/components/ui/button";
import { listLogs } from "@/lib/platform.functions";

export const Route = createFileRoute("/_shell/admin/logs")({
  head: () => ({
    meta: [
      { title: "User Logs & Activity | MTL Report Platform Administration" },
      {
        name: "description",
        content:
          "Audit trail of every sign-in, template upload, workbook import, connection test and report action on the MTL report platform.",
      },
      { property: "og:title", content: "User Logs & Activity | MTL Report Platform Administration" },
      { property: "og:description", content: "Full audit trail of MTL report platform user activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminLogsPage,
});

function AdminLogsPage() {
  const { data: logs = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["logs"],
    queryFn: () => listLogs(),
  });

  return (
    <>
      <PageHeading
        title="User Logs & Activity"
        subtitle="Every action taken in the platform, recorded in the database"
        actions={
          <Button size="sm" variant="outline" disabled={isFetching} onClick={() => void refetch()}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
        }
      />

      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-[11px] tracking-wider text-muted-foreground uppercase">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Time</th>
                <th className="px-4 py-3 text-left font-semibold">Actor</th>
                <th className="px-4 py-3 text-left font-semibold">Action</th>
                <th className="px-4 py-3 text-left font-semibold">Resource</th>
                <th className="px-5 py-3 text-right font-semibold">Result</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-sm text-muted-foreground">
                    Loading activity…
                  </td>
                </tr>
              ) : null}
              {!isLoading && logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-sm text-muted-foreground">
                    No activity recorded yet.
                  </td>
                </tr>
              ) : null}
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-border hover:bg-secondary/50">
                  <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs font-semibold">{l.actor}</td>
                  <td className="px-4 py-3 font-mono text-xs">{l.action}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{l.resource ?? "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <StatusBadge tone={l.result === "success" ? "ok" : "crit"}>{l.result}</StatusBadge>
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
