import { createFileRoute } from "@tanstack/react-router";
import { GripVertical, Pencil, Plus, Save } from "lucide-react";

import { PageHeading } from "@/components/noc/PageHeading";
import { StatusBadge } from "@/components/noc/StatusDot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { templateSections } from "@/lib/noc-data";

export const Route = createFileRoute("/_shell/templates")({
  head: () => ({
    meta: [
      { title: "Report Template Management | MTL ANPMRS" },
      {
        name: "description",
        content:
          "Design MTL report templates: executive summary, availability, bandwidth analysis, incidents and recommendations.",
      },
      { property: "og:title", content: "Report Template Management | MTL ANPMRS" },
      {
        property: "og:description",
        content: "Administer reusable MTL management report templates and their sections.",
      },
    ],
  }),
  component: TemplatesPage,
});

const templates = [
  { name: "MTL Monthly Network Performance Report", sections: 5, owner: "A. Nyirenda", active: true },
  { name: "MTL Weekly Performance Summary", sections: 4, owner: "G. Phiri", active: false },
  { name: "MTL SLA Compliance Report", sections: 6, owner: "A. Nyirenda", active: false },
  { name: "MTL Incident Post-Mortem", sections: 5, owner: "T. Banda", active: false },
];

function TemplatesPage() {
  return (
    <>
      <PageHeading
        title="Report Template Management"
        subtitle="Administrator-controlled report structures used by the automation scheduler"
        actions={
          <>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" /> New template
            </Button>
            <Button size="sm">
              <Save className="mr-2 h-4 w-4" /> Save Template
            </Button>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[300px_1fr]">
        <aside className="panel h-fit p-4">
          <h3 className="mb-3 text-sm font-bold">Templates</h3>
          <ul className="space-y-2">
            {templates.map((t) => (
              <li key={t.name}>
                <button
                  className={`w-full rounded-md border p-3 text-left text-sm transition-colors ${
                    t.active
                      ? "border-mtl-blue bg-mtl-blue/8 font-semibold"
                      : "border-border hover:border-mtl-blue/40"
                  }`}
                >
                  <p className="leading-snug">{t.name}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {t.sections} sections · {t.owner}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="panel p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-5">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Template name
              </p>
              <Input
                defaultValue="MTL Monthly Network Performance Report"
                className="mt-2 border-transparent bg-secondary font-display text-lg font-bold"
              />
            </div>
            <StatusBadge tone="ok">Active</StatusBadge>
          </div>

          <div className="mt-5 space-y-3">
            {templateSections.map((s, i) => (
              <article key={s.title} className="rounded-md border border-border bg-secondary/50 p-4">
                <div className="flex items-start gap-3">
                  <GripVertical className="mt-1 h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded bg-mtl-blue text-[11px] font-bold text-mtl-blue-foreground">
                        {i + 1}
                      </span>
                      <h4 className="text-sm font-bold">{s.title}</h4>
                    </div>
                    <Textarea
                      defaultValue={s.detail}
                      rows={2}
                      className="mt-3 resize-none border-border bg-card text-xs"
                    />
                  </div>
                  <Button variant="ghost" size="sm">
                    <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Add Section
            </Button>
            <Button variant="outline">Edit Template</Button>
            <Button>
              <Save className="mr-2 h-4 w-4" /> Save Template
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
