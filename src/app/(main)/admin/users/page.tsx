"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Crown, Star, ArrowUp, ArrowDown, Users } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@/interfaces/user.interface";

function RoleBadge({ isAdmin }: { isAdmin: User["isAdmin"] }) {
  if (isAdmin === "master") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2.5 py-0.5 text-caption font-semibold text-purple-400">
        <Crown className="h-3 w-3" />
        Master
      </span>
    );
  }
  if (isAdmin === "normal") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-caption font-semibold text-blue-400">
        <Star className="h-3 w-3" />
        Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-bg-highlight px-2.5 py-0.5 text-caption text-text-muted">
      User
    </span>
  );
}

function RoleActions({
  currentRole,
  userId,
  currentUserId,
  onChange,
  isUpdating,
}: {
  currentRole: User["isAdmin"];
  userId: string;
  currentUserId: string;
  onChange: (role: "normal" | "master" | null) => void;
  isUpdating: boolean;
}) {
  const isSelf = userId === currentUserId;
  if (isSelf) return <span className="text-caption text-text-muted">—</span>;

  return (
    <div className="flex items-center gap-1">
      {currentRole !== "normal" && (
        <button
          onClick={() => onChange("normal")}
          disabled={isUpdating}
          title="Promote to Admin"
          className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-1 text-caption font-medium text-blue-400 transition-colors hover:bg-blue-500/30 disabled:opacity-50"
        >
          <ArrowUp className="h-3 w-3" />
          Admin
        </button>
      )}
      {currentRole !== "master" && (
        <button
          onClick={() => onChange("master")}
          disabled={isUpdating}
          title="Promote to Master"
          className="flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-1 text-caption font-medium text-purple-400 transition-colors hover:bg-purple-500/30 disabled:opacity-50"
        >
          <Crown className="h-3 w-3" />
          Master
        </button>
      )}
      {currentRole !== null && (
        <button
          onClick={() => onChange(null)}
          disabled={isUpdating}
          title="Demote to User"
          className="flex items-center gap-1 rounded-full bg-bg-highlight px-2 py-1 text-caption font-medium text-text-muted transition-colors hover:bg-danger/20 hover:text-danger disabled:opacity-50"
        >
          <ArrowDown className="h-3 w-3" />
          User
        </button>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { users, isLoading, updateRole, isUpdating } = useUsers();
  const router = useRouter();

  useEffect(() => {
    if (currentUser && currentUser.isAdmin !== "master") {
      router.replace("/");
    }
  }, [currentUser, router]);

  if (currentUser?.isAdmin !== "master") return null;

  return (
    <div className="animate-fade-slide-in pt-4">
      <div className="mb-6 flex items-center gap-3">
        <Users className="h-7 w-7 text-accent" />
        <h1 className="text-h2">Quản lý người dùng</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-bg-secondary">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_1fr_120px_180px] gap-4 border-b border-border px-6 py-3 text-caption font-semibold uppercase tracking-wider text-text-muted">
          <span>Tên</span>
          <span>Email</span>
          <span>Vai trò</span>
          <span className="text-right">Hành động</span>
        </div>

        {isLoading && (
          <div className="space-y-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_1fr_120px_180px] gap-4 border-b border-border px-6 py-4"
              >
                <div className="h-5 w-32 animate-pulse rounded bg-bg-elevated" />
                <div className="h-5 w-48 animate-pulse rounded bg-bg-elevated" />
                <div className="h-6 w-16 animate-pulse rounded-full bg-bg-elevated" />
                <div className="h-6 w-24 animate-pulse rounded-full bg-bg-elevated" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && users && users.length === 0 && (
          <div className="px-6 py-12 text-center text-text-muted">
            No users found.
          </div>
        )}

        {!isLoading && users && users.length > 0 && (
          <div className="divide-y divide-border">
            {users.map((user) => (
              <div
                key={user._id}
                className="grid grid-cols-[1fr_1fr_120px_180px] items-center gap-4 px-6 py-4 transition-colors hover:bg-bg-elevated"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-body font-semibold text-black">
                    {user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <span className="truncate text-body font-medium text-text-primary">
                    {user.name || "—"}
                  </span>
                </div>

                <span className="truncate text-body text-text-secondary">
                  {user.email}
                </span>

                <RoleBadge isAdmin={user.isAdmin} />

                <div className="flex justify-end">
                  <RoleActions
                    currentRole={user.isAdmin}
                    userId={user._id}
                    currentUserId={currentUser?._id ?? ""}
                    onChange={(role) => updateRole({ userId: user._id, isAdmin: role })}
                    isUpdating={isUpdating}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
