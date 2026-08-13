import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  Plug,
  Search,
  Settings,
  ShieldCheck,
  ScrollText,
  Table2,
  Users,
  LayoutTemplate,
} from "lucide-react";
import { useEffect } from "react";

import { MtlLogo } from "@/components/noc/MtlLogo";
import { StatusDot } from "@/components/noc/StatusDot";
import { Input } from "@/components/ui/input";
import { signOut, useSession } from "@/lib/auth";

export const Route = createFileRoute("/_shell")({
  component: ShellLayout,
});

const engineerNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/uploads", label: "Infrastructure Files", icon: Table2 },
  { to: "/templates", label: "Report Templates", icon: LayoutTemplate },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/integrations", label: "Integrations", icon: Plug },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const adminNav = [
  { to: "/admin", label: "Admin Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Manage Users", icon: Users },
  { to: "/admin/logs", label: "User Logs & Activity", icon: ScrollText },
  { to: "/admin/integrations", label: "Integrations", icon: Plug },
  { to: "/admin/security", label: "Security", icon: ShieldCheck },
  { to: "/templates", label: "Report Templates", icon: LayoutTemplate },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const titles: Record<string, string> = {
  "/dashboard": "Report Creation Dashboard",
  "/uploads": "Infrastructure File Uploads",
  "/reports": "Report Creation & Archive",
  "/templates": "Word Report Templates",
  "/integrations": "Integrations",
  "/settings": "System Settings",
  "/admin": "System Administrator Dashboard",
  "/admin/users": "Manage Users",
  "/admin/logs": "User Logs & Activity",
  "/admin/integrations": "Integrations",
  "/admin/security": "Security",
};

function ShellLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const session = useSession();
  const isAdmin = session?.role === "admin";
  const nav = isAdmin ? adminNav : engineerNav;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem("mtl-anpmrs-session")) {
      navigate({ to: "/" });
    }
  }, [navigate, pathname]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <MtlLogo />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => {
            const active = item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-[inset_3px_0_0_0_var(--sidebar-primary)]"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">
              {session?.initials ?? "MTL"}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold">{session?.title ?? "Signed out"}</p>
              <p className="truncate text-[11px] text-sidebar-foreground/65">{session?.unit ?? "MTL"}</p>
            </div>
            <button
              type="button"
              aria-label="Sign out"
              onClick={() => {
                signOut();
                navigate({ to: "/" });
              }}
              className="text-sidebar-foreground/60 hover:text-sidebar-primary"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-card px-5">
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-lg font-bold">{titles[pathname] ?? "MTL ANPMRS"}</h2>
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              Malawi Telecommunications Limited • Automated report creation from Word templates
            </p>
          </div>
          <div className="relative hidden w-72 md:block">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search customers, templates, reports…" className="bg-secondary pl-9" />
          </div>
          <Link
            to={isAdmin ? "/admin/users" : "/settings"}
            className="flex items-center gap-2 rounded-md border border-border py-1.5 pr-3 pl-1.5 hover:border-mtl-blue/50"
          >
            <div className="grid h-7 w-7 place-items-center rounded-full bg-mtl-blue text-[11px] font-bold text-mtl-blue-foreground">
              {session?.initials ?? "MTL"}
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-xs font-semibold">{session?.name ?? "MTL user"}</p>
              <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <StatusDot tone="ok" className="h-1.5 w-1.5" /> {session?.title ?? "—"}
              </p>
            </div>
          </Link>
        </header>
        <main className="flex-1 p-5 lg:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}