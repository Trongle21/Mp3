import { Skeleton } from "@/components/ui/skeleton";

export function TrackSkeleton() {
  return (
    <div className="grid grid-cols-[32px_1fr_1fr_80px_32px] items-center gap-4 px-3 py-2">
      <Skeleton className="h-4 w-4" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-3.5 w-2/3" />
      <Skeleton className="h-3.5 w-10" />
      <Skeleton className="h-4 w-4" />
    </div>
  );
}
