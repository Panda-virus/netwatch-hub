import { createFileRoute, Link } from "@tanstack/react-router";

import { IntegrationsManager } from "@/components/noc/IntegrationsManager";
import { PageHeading } from "@/components/noc/PageHeading";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_shell/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations | MTL Report Platform" },
      { name: "description", content: "Manage the graph sources the MTL report platform signs in to: connection details, stored credentials and live reachability tests." },
      { property: "og:title", content: "Integrations | MTL Report Platform" },
      { property: "og:description", content: "Connect, test and update credentials for MTL report graph sources." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  return (
    <>
      <PageHeading
        title="Integrations"
        subtitle="Graph sources the platform signs in to when capturing report screenshots"
      />
      <IntegrationsManager canDelete={{false}} />
      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </>
  );
}
