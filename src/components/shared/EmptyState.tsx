import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-slide-in">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg-elevated">
        <Icon className="h-7 w-7 text-text-muted" />
      </div>
      <h3 className="text-h3 text-text-primary">{title}</h3>
      <p className="mt-1 max-w-xs text-body text-text-secondary">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
