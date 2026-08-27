"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md rounded-xl border border-border bg-bg-secondary p-8 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
          <AlertTriangle className="h-6 w-6 text-danger" />
        </div>
        <h1 className="text-h2 text-text-primary">Something went wrong</h1>
        <p className="mt-2 text-body text-text-secondary">
          An unexpected error occurred. Try again, or come back later.
        </p>
        {error.digest && (
          <p className="mt-3 text-caption text-text-muted">Error ID: {error.digest}</p>
        )}
        <div className="mt-6">
          <Button onClick={reset} className="w-full">
            <RotateCcw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}