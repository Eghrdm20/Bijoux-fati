"use client";

import type { ReactNode } from "react";
import { PiAuthProvider, usePiAuth } from "@/contexts/pi-auth-context";
import { AuthLoadingScreen } from "./auth-loading-screen";

const requirePiAuth = process.env.NEXT_PUBLIC_REQUIRE_PI_AUTH === "true";

function AppContent({ children }: { children: ReactNode }) {
  const { isAuthenticated, hasError } = usePiAuth();

  // On Vercel/browser preview we allow the store to open without Pi auth.
  // Set NEXT_PUBLIC_REQUIRE_PI_AUTH=true when submitting the app inside Pi Browser.
  if (!requirePiAuth) return <>{children}</>;

  if (!isAuthenticated && !hasError) return <AuthLoadingScreen />;
  if (hasError) return <AuthLoadingScreen />;
  return <>{children}</>;
}

export function AppWrapper({ children }: { children: ReactNode }) {
  return (
    <PiAuthProvider>
      <AppContent>{children}</AppContent>
    </PiAuthProvider>
  );
}
