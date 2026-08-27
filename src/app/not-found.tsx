import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md rounded-xl border border-border bg-bg-secondary p-8 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
          <Compass className="h-6 w-6 text-accent" />
        </div>
        <h1 className="text-h2 text-text-primary">Page not found</h1>
        <p className="mt-2 text-body text-text-secondary">
          We couldn&apos;t find what you were looking for.
        </p>
        <div className="mt-6">
          <Button asChild className="w-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}