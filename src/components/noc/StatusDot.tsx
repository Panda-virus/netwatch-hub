import { cn } from "@/lib/utils";

type Tone = "ok" | "warn" | "crit" | "info";

const toneDot: Record<Tone, string> = {
  ok: "bg-status-ok",
  warn: "bg-status-warn",
  crit: "bg-status-crit",
  info: "bg-mtl-blue-light",
};

const toneBadge: Record<Tone, string> = {
  ok: "bg-status-ok-soft text-status-ok border-status-ok/30",
  warn: "bg-status-warn-soft text-status-warn border-status-warn/30",
  crit: "bg-status-crit-soft text-status-crit border-status-crit/30",
  info: "bg-secondary text-mtl-blue border-mtl-blue/20",
};

export function StatusDot({ tone, pulse = false, className }: { tone: Tone; pulse?: boolean; className?: string }) {
  return (
    <span className={cn("inline-block h-2.5 w-2.5 rounded-full", toneDot[tone], pulse && "pulse-dot", className)} />
  );
}

export function StatusBadge({
  tone,
  children,
  pulse = false,
}: {
  tone: Tone;
  children: React.ReactNode;
  pulse?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider",
        toneBadge[tone],
      )}
    >
      <StatusDot tone={tone} pulse={pulse} className="h-2 w-2" />
      {children}
    </span>
  );
}

export function toneForStatus(status: string): Tone {
  const s = status.toLowerCase();
  if (["online", "healthy", "active", "resolved", "ok"].includes(s)) return "ok";
  if (["warning", "acknowledged", "maintenance", "suspended"].includes(s)) return "warn";
  if (["offline", "critical", "open", "failure", "down"].includes(s)) return "crit";
  return "info";
}