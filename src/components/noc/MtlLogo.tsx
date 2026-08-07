export function MtlLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-mtl-yellow font-display text-sm font-extrabold tracking-tight text-mtl-yellow-foreground">
        MTL
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className="font-display text-sm font-bold tracking-wide">ANPMRS</p>
          <p className="text-[11px] text-current/70">Network Operations Centre</p>
        </div>
      )}
    </div>
  );
}