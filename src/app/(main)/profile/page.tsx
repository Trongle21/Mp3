"use client";

import { useUser } from "@/hooks/useUser";
import { AvatarSection } from "@/components/profile/AvatarSection";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { AdminBadge } from "@/components/profile/AdminBadge";

export default function ProfilePage() {
  const { user, isLoading, updateProfile, isUpdating, uploadAvatar, deleteAvatar } = useUser();

  if (isLoading) {
    return (
      <div className="animate-fade-slide-in flex flex-col gap-6 pt-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-28 w-28 animate-pulse rounded-full bg-bg-elevated" />
          <div className="h-8 w-36 animate-pulse rounded-full bg-bg-elevated" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-bg-elevated" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 pt-20 text-text-muted">
        <p>Could not load profile.</p>
      </div>
    );
  }

  const isUploading = false; // merge loading states if needed

  return (
    <div className="animate-fade-slide-in flex flex-col gap-8 pt-4">
      <div className="flex flex-col items-center gap-6 rounded-xl border border-border bg-bg-secondary p-6">
        <AvatarSection
          avatarUrl={user.avatarUrl}
          onUpload={uploadAvatar}
          onDelete={deleteAvatar}
          isLoading={isUpdating}
        />

        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-h3 font-bold text-text-primary">{user.name}</h1>
          {user.isAdmin && <AdminBadge type={user.isAdmin} />}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-bg-secondary p-6">
        <h2 className="mb-5 text-h4 font-semibold text-text-primary">My Profile</h2>
        <ProfileForm user={user} onSave={updateProfile} isSaving={isUpdating} />
      </div>
    </div>
  );
}
