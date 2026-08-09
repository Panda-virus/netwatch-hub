import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, FileText, Lock, ShieldCheck, User } from "lucide-react";

import loginBg from "@/assets/login-network-bg.jpg";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MTL ANPMRS Login | Network Performance Monitoring" },
      {
        name: "description",
        content:
          "Secure sign-in to the MTL Automated Network Performance Monitoring & Reporting System for Malawi Telecommunications NOC engineers.",
      },
      { property: "og:title", content: "MTL ANPMRS Login | Network Performance Monitoring" },
      {
        property: "og:description",
        content: "Sign in to the MTL infrastructure reporting automation platform.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-mtl-blue-deep px-4 py-10">
      <img
        src={loginBg}
        alt="Fiber optic strands carrying network traffic across the MTL backbone"
        width={1920}
        height={1280}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-mtl-blue-deep/90 via-mtl-blue/70 to-mtl-blue-deep/95" />
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-40" />

      <div className="relative z-10 w-full max-w-5xl grid items-center gap-10 lg:grid-cols-[1.1fr_420px]">
        <div className="hidden text-mtl-blue-foreground lg:block">
          <span className="inline-flex items-center gap-2 rounded-full border border-mtl-yellow/40 bg-mtl-blue-deep/50 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-mtl-yellow">
            Malawi Telecommunications Limited
          </span>
          <h1 className="mt-5 max-w-xl text-4xl leading-tight font-extrabold">
            Automated Network Performance Monitoring & Reporting System
          </h1>
          <p className="mt-4 max-w-lg text-sm text-mtl-blue-foreground/80">
            Continuous collection from Observium, SolarWinds, SNMP and SSH — turned into live network visibility,
            SLA tracking and management-ready reports for the MTL Network Operations Centre.
          </p>
          <ul className="mt-8 grid max-w-lg gap-4 sm:grid-cols-3">
            <Feature icon={Activity} label="Automated reporting" detail="SolarWinds & Observium" />
            <Feature icon={FileText} label="Automated reporting" detail="Daily to monthly SLA" />
            <Feature icon={ShieldCheck} label="Audit ready" detail="24-month retention" />
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-7 shadow-raised">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-md bg-mtl-yellow font-display text-base font-extrabold text-mtl-yellow-foreground">
              MTL
            </div>
            <div className="leading-tight">
              <p className="font-display text-sm font-bold">ANPMRS</p>
              <p className="text-[11px] text-muted-foreground">Network Operations Centre</p>
            </div>
          </div>

          <h2 className="mt-6 text-lg font-bold">
            MTL Automated Network Performance Monitoring System
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Sign in with your MTL NOC domain credentials.
          </p>

          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-semibold">
                Username
              </Label>
              <div className="relative">
                <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="username" placeholder="g.phiri" autoComplete="username" className="bg-secondary pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  className="bg-secondary pl-9"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-muted-foreground">
                <Checkbox /> Keep me signed in on this workstation
              </label>
            </div>

            <Button asChild className="w-full">
              <Link to="/dashboard">Login</Link>
            </Button>

            <p className="text-center text-xs">
              <a href="#" className="font-semibold text-mtl-blue hover:underline">
                Forgot password?
              </a>
            </p>
          </form>

          <p className="mt-6 border-t border-border pt-4 text-[11px] leading-relaxed text-muted-foreground">
            Authorised access only. All sessions and device interactions are recorded in the MTL NOC audit log.
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, label, detail }: { icon: React.ElementType; label: string; detail: string }) {
  return (
    <li className="rounded-lg border border-mtl-blue-foreground/15 bg-mtl-blue-deep/40 p-4">
      <Icon className="h-4 w-4 text-mtl-yellow" />
      <p className="mt-2 text-xs font-bold">{label}</p>
      <p className="text-[11px] text-mtl-blue-foreground/70">{detail}</p>
    </li>
  );
}
