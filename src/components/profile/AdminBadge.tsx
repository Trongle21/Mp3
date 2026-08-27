"use client";

import { Crown, Star } from "lucide-react";

interface AdminBadgeProps {
  type: "master" | "normal";
}

export function AdminBadge({ type }: AdminBadgeProps) {
  if (type === "master") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-caption font-semibold text-accent">
        <Crown className="h-3.5 w-3.5" />
        Trùm
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-caption font-semibold text-accent">
      <Star className="h-3.5 w-3.5" />
      Quản lý
    </span>
  );
}
