"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen m-0 flex items-center justify-center bg-[#0b0b0b] text-white font-sans p-4">
        <div className="max-w-[420px] text-center">
          <h1 className="text-2xl mb-2">Something went wrong</h1>
          <p className="text-gray-400 mb-4">
            An unexpected error occurred. Please try again.
          </p>
          {error.digest && (
            <p className="text-gray-600 text-xs mb-4">
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-[#1a1a1a] text-white border border-[#333] rounded-lg cursor-pointer hover:bg-[#222] transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
