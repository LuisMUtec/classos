"use client";

import * as React from "react";

export type Role = "teacher" | "student";

const STORAGE_KEY = "edhack:role";
const DEFAULT_ROLE: Role = "teacher";

interface RoleContextValue {
  role: Role;
  setRole: (next: Role) => void;
  toggleRole: () => void;
  ready: boolean;
}

const RoleContext = React.createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = React.useState<Role>(DEFAULT_ROLE);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "teacher" || stored === "student") {
        setRoleState(stored);
      }
    } catch {
      // localStorage unavailable (SSR, private mode) — keep default
    }
    setReady(true);
  }, []);

  const setRole = React.useCallback((next: Role) => {
    setRoleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const toggleRole = React.useCallback(() => {
    setRoleState((prev) => {
      const next = prev === "teacher" ? "student" : "teacher";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const value = React.useMemo(
    () => ({ role, setRole, toggleRole, ready }),
    [role, setRole, toggleRole, ready],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const ctx = React.useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRole must be used inside <RoleProvider>");
  }
  return ctx;
}
