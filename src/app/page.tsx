"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isInitializing } = useAuth();

  useEffect(() => {
    if (isInitializing) return;
    router.replace(isAuthenticated ? "/library" : "/login");
  }, [isAuthenticated, isInitializing, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  );
}
