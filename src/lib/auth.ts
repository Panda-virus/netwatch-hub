import { useEffect, useState } from "react";

export type Role = "engineer" | "admin";

export type Session = {
  email: string;
  name: string;
  initials: string;
  role: Role;
  title: string;
  unit: string;
};

const ACCOUNTS: Array<Session & { password: string }> = [
  {
    email: "christasia@mtl.com",
    password: "christasia",
    name: "Christasia Mkandawire",
    initials: "CM",
    role: "engineer",
    title: "NOC Engineer",
    unit: "Report Preparation",
  },
  {
    email: "infrareportadmin@mtl.com",
    password: "systemadmin",
    name: "Infra Report Admin",
    initials: "IA",
    role: "admin",
    title: "System Administrator",
    unit: "Platform Administration",
  },
];

const KEY = "mtl-anpmrs-session";

export function signIn(email: string, password: string): Session | null {
  const found = ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password,
  );
  if (!found) return null;
  const { password: _pw, ...session } = found;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(session));
    window.dispatchEvent(new Event("mtl-session-change"));
  }
  return session;
}

export function signOut() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("mtl-session-change"));
}

export function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    const sync = () => setSession(readSession());
    sync();
    window.addEventListener("mtl-session-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("mtl-session-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return session;
}