"use client";

import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthRequiredPage() {
  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-8 text-center">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
        <Lock className="h-6 w-6 text-accent" />
      </div>
      <h1 className="text-h2 text-text-primary">You need to log in</h1>
      <p className="mt-2 text-body text-text-secondary">
        Please sign in to continue listening to your music.
      </p>
      <div className="mt-6 flex flex-col gap-2">
        <Button asChild className="w-full">
          <Link href="/login">
            Go to login
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/register">Create an account</Link>
        </Button>
      </div>
    </div>
  );
}
