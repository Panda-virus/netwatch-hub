import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bell,
  FileText,
  LayoutDashboard,
  LogOut,
  Router as RouterIcon,
  Search,
  Settings,
  ShieldAlert,
  Users,
  LayoutTemplate,
} from "lucide-react";

import { MtlLogo } from "@/components/noc/MtlLogo";
import { StatusDot } from "@/components/noc/StatusDot";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_shell")({
  component: ShellLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/devices", label: "Network Devices", icon: RouterIcon },
  { to: "/monitoring", label: "Live Monitoring", icon: Activity },
  { to: "/alerts", label: "Alerts", icon: ShieldAlert, badge: "12" },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/templates", label: "Report Templates", icon: LayoutTemplate },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/users", label: "Users", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const titles: Record<string, string> = {
  "/dashboard": "Network Operations Dashboard",
  "/devices": "Network Devices",
  "/monitoring": "Live Network Monitoring",
  "/alerts": "Alert Management Centre",
  "/reports": "Automated Report Generation",
  "/templates": "Report Template Management",
  "/analytics": "Analytics & Performance Trends",
  "/users": "User Management",
  "/settings": "System Settings",
};

function ShellLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <MtlLogo />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => {
            const active = pathname.startsWith(item.to);
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
                {"badge" in item && item.badge && (
                  <span className="rounded-full bg-sidebar-primary px-2 py-0.5 text-[10px] font-bold text-sidebar-primary-foreground">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">
              GP
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold">NOC Engineer</p>
              <p className="truncate text-[11px] text-sidebar-foreground/65">South Region</p>
            </div>
            <Link to="/" aria-label="Sign out" className="text-sidebar-foreground/60 hover:text-sidebar-primary">
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-card px-5">
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-lg font-bold">{titles[pathname] ?? "MTL ANPMRS"}</h2>
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              Malawi Telecommunications Limited • Data sources: Observium, SolarWinds, SNMP
            </p>
          </div>
          <div className="relative hidden w-72 md:block">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search devices, alerts, reports…" className="bg-secondary pl-9" />
          </div>
          <button
            className="relative grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground hover:text-mtl-blue"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-status-crit px-1 text-[10px] font-bold text-mtl-blue-foreground">
              5
            </span>
          </button>
          <div className="flex items-center gap-2 rounded-md border border-border py-1.5 pr-3 pl-1.5">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-mtl-blue text-[11px] font-bold text-mtl-blue-foreground">
              GP
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-xs font-semibold">Grace Phiri</p>
              <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <StatusDot tone="ok" className="h-1.5 w-1.5" /> On shift
              </p>
            </div>
          </div>
        </header>
        <main className="flex-1 p-5 lg:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}