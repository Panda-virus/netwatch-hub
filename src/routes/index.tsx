import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileStack, FileText, Lock, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";

import loginBg from "@/assets/login-network-bg.jpg";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MTL Infrastructure Report Platform | Sign in" },
      {
        name: "description",
        content:
          "Secure sign-in to the MTL Automated Report Creation Platform used by Malawi Telecommunications NOC engineers and system administrators.",
      },
      { property: "og:title", content: "MTL Infrastructure Report Platform | Sign in" },
      {
        property: "og:description",
        content: "Sign in to the MTL infrastructure report creation platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const session = signIn(email, password);
    if (!session) {
      setError("Incorrect email or password. Use your MTL platform credentials.");
      return;
    }
    setError(null);
    navigate({ to: session.role === "admin" ? "/admin" : "/dashboard" });
  }

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
            Automated Report Creation Platform
          </h1>
          <p className="mt-4 max-w-lg text-sm text-mtl-blue-foreground/80">
            Upload the Word report template, let the platform read it, capture that day's graphs and produce an
            identical report with the day's figures — prepared for MTL management review.
          </p>
          <ul className="mt-8 grid max-w-lg gap-4 sm:grid-cols-3">
            <Feature icon={FileStack} label="Reads templates" detail="Word (.docx) driven" />
            <Feature icon={FileText} label="Duplicates reports" detail="With today's graphs" />
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

          <h2 className="mt-6 text-lg font-bold">MTL Automated Report Creation Platform</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Sign in with your MTL platform email address.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="christasia@mtl.com"
                  autoComplete="username"
                  className="bg-secondary pl-9"
                />
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  className="bg-secondary pl-9"
                />
              </div>
            </div>

            {error ? (
              <p role="alert" className="rounded-md border border-status-crit/40 bg-status-crit/10 px-3 py-2 text-xs font-semibold text-status-crit">
                {error}
              </p>
            ) : null}

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-muted-foreground">
                <Checkbox /> Keep me signed in on this workstation
              </label>
            </div>

            <Button type="submit" className="w-full">
              Login
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Forgotten your password? Contact the system administrator at{" "}
              <a href="mailto:infrareportadmin@mtl.com" className="font-semibold text-mtl-blue hover:underline">
                infrareportadmin@mtl.com
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
