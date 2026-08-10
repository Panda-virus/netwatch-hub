import { createFileRoute, Link } from "@tanstack/react-router";
import { CopyCheck, Download, FileStack, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeading } from "@/components/noc/PageHeading";
import { StatusBadge } from "@/components/noc/StatusDot";
import { Button } from "@/components/ui/button";
import { templatePlaceholders, wordTemplates } from "@/lib/report-data";

export const Route = createFileRoute("/_shell/templates")({
  head: () => ({
    meta: [
      { title: "Word Report Templates | MTL Report Platform" },
      {
        name: "description",
        content:
          "Upload the MTL Word report template, review the placeholders and graph slots the platform detected, and duplicate it with the day's figures.",
      },
      { property: "og:title", content: "Word Report Templates | MTL Report Platform" },
      {
        property: "og:description",
        content: "Word (.docx) templates read by the platform and duplicated with today's graphs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TemplatesPage,
});

function TemplatesPage() {
  const [selectedId, setSelectedId] = useState(wordTemplates.find((t) => t.active)!.id);
  const selected = wordTemplates.find((t) => t.id === selectedId)!;

  return (
    <>
      <PageHeading
        title="Word Report Templates"
        subtitle="The platform reads the uploaded .docx, then duplicates it with the current day's graphs and figures"
        actions={
          <>
            <label className="inline-flex">
              <input
                type="file"
                accept=".docx"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) toast.success(`${file.name} uploaded — reading placeholders and graph slots`);
                }}
              />
              <span className="inline-flex h-9 cursor-pointer items-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent">
                <Upload className="mr-2 h-4 w-4" /> Upload .docx template
              </span>
            </label>
            <Button
              size="sm"
              onClick={() =>
                toast.success(`Duplicating ${selected.file} with today's graphs`, {
                  description: "Placeholders will be replaced with the figures read from today's captures.",
                })
              }
            >
              <CopyCheck className="mr-2 h-4 w-4" /> Duplicate with today's graphs
            </Button>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
        <aside className="panel h-fit p-4">
          <h3 className="mb-3 text-sm font-bold">Uploaded templates</h3>
          <ul className="space-y-2">
            {wordTemplates.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(t.id)}
                  className={`w-full rounded-md border p-3 text-left text-sm transition-colors ${
                    t.id === selectedId
                      ? "border-mtl-blue bg-mtl-blue/8 font-semibold"
                      : "border-border hover:border-mtl-blue/40"
                  }`}
                >
                  <p className="leading-snug">{t.label}</p>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">{t.file}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {t.placeholders} placeholders · {t.graphSlots} graph slots
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="panel p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-5">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Selected template
              </p>
              <h3 className="mt-1 font-display text-lg font-bold">{selected.label}</h3>
              <p className="font-mono text-xs text-muted-foreground">
                {selected.file} · uploaded {selected.uploaded} by {selected.by}
              </p>
            </div>
            <StatusBadge tone={selected.active ? "ok" : "info"}>
              {selected.active ? "Active template" : "Available"}
            </StatusBadge>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Stat label="Placeholders read" value={String(selected.placeholders)} />
            <Stat label="Graph slots" value={String(selected.graphSlots)} />
            <Stat label="Layout" value="Preserved exactly" />
          </div>

          <h4 className="mt-6 flex items-center gap-2 text-sm font-bold">
            <FileStack className="h-4 w-4 text-mtl-blue" /> What the platform found in the document
          </h4>
          <p className="text-xs text-muted-foreground">
            Each placeholder is replaced with today's value; everything else stays identical to the original report.
          </p>

          <div className="mt-4 overflow-x-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-[11px] tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Placeholder</th>
                  <th className="px-4 py-3 text-left font-semibold">Meaning in the report</th>
                  <th className="px-4 py-3 text-left font-semibold">Source</th>
                  <th className="px-4 py-3 text-left font-semibold">Today's value</th>
                </tr>
              </thead>
              <tbody>
                {templatePlaceholders.map((p) => (
                  <tr key={p.token} className="border-t border-border hover:bg-secondary/50">
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{p.token}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.meaning}</td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={p.source === "graph" ? "info" : "ok"}>{p.source}</StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-xs">{p.todaysValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => toast.info(`Re-reading ${selected.file} for placeholders and graph slots`)}
            >
              Re-read template
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.success(`${selected.label} set as the active template`)}
            >
              Set as active
            </Button>
            <Button variant="outline" onClick={() => toast.success(`Downloading ${selected.file}`)}>
              <Download className="mr-2 h-4 w-4" /> Download original
            </Button>
            <Button asChild>
              <Link to="/reports">Create report from this template</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/60 p-4">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
      <p className="mt-2 font-display text-xl font-bold">{value}</p>
    </div>
  );
}