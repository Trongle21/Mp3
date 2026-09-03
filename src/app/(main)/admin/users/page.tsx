'use client';

import { EditUserModal } from '@/components/admin/EditUserModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useAdminPage } from '@/hooks';
import type { IUpdateUserBody, IUser } from '@/interfaces';
import {
  ArrowDown,
  ArrowUp,
  Crown,
  Pencil,
  Star,
  Trash2,
  Users,
} from 'lucide-react';
import Image from 'next/image';

function RoleBadge({ isAdmin }: { isAdmin: IUser['isAdmin'] }) {
  if (isAdmin === 'master') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2.5 py-0.5 text-caption font-semibold text-purple-400">
        <Crown className="h-3 w-3" />
        Master
      </span>
    );
  }
  if (isAdmin === 'normal') {
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

interface IRoleActionsProps {
  currentRole: IUser['isAdmin'];
  userId: string;
  currentUserId: string;
  onChange: (role: 'normal' | null) => void;
  isUpdating: boolean;
}

function RoleActions(props: IRoleActionsProps) {
  const { currentRole, userId, currentUserId, onChange, isUpdating } = props;
  const isSelf = userId === currentUserId;
  if (isSelf) {
    return <span className="text-caption text-text-muted">Yourself</span>;
  }

  if (currentRole === 'master') {
    return <span className="text-caption text-text-muted">Cannot change</span>;
  }

  if (currentRole === 'normal') {
    return (
      <button
        onClick={() => onChange(null)}
        disabled={isUpdating}
        title="Demote to User"
        className="flex items-center gap-1 rounded-full bg-bg-highlight px-2 py-1 text-caption font-medium text-text-muted transition-colors hover:bg-danger/20 hover:text-danger disabled:opacity-50"
      >
        <ArrowDown className="h-3 w-3" />
        User
      </button>
    );
  }

  return (
    <button
      onClick={() => onChange('normal')}
      disabled={isUpdating}
      title="Promote to Admin"
      className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-1 text-caption font-medium text-blue-400 transition-colors hover:bg-blue-500/30 disabled:opacity-50"
    >
      <ArrowUp className="h-3 w-3" />
      Admin
    </button>
  );
}

export default function AdminUsersPage() {
  const {
    currentUser,
    users,
    isLoading,
    handleUpdateRole,
    handleUpdateUser,
    handleDeleteUser,
    isUpdatingRole,
    isUpdatingUser,
    isDeletingUser,
    editingUser,
    deletingUser,
    setEditingUser,
    setDeletingUser,
  } = useAdminPage();

  if (currentUser?.isAdmin !== 'master') {
    return null;
  }

  return (
    <div className="animate-fade-slide-in pt-4">
      <div className="mb-6 flex items-center gap-3">
        <Users className="h-7 w-7 text-accent" />
        <h1 className="text-h2">Manage users</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-bg-secondary">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_1fr_120px_180px] gap-4 border-b border-border px-6 py-3 text-caption font-semibold uppercase tracking-wider text-text-muted">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span className="text-right">Actions</span>
        </div>

        {isLoading && (
          <div className="space-y-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_1fr_120px_180px] gap-4 border-b border-border px-6 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 animate-pulse rounded-full bg-bg-elevated" />
                  <div className="h-5 w-32 animate-pulse rounded bg-bg-elevated" />
                </div>
                <div className="h-5 w-48 animate-pulse rounded bg-bg-elevated" />
                <div className="h-6 w-16 animate-pulse rounded-full bg-bg-elevated" />
                <div className="h-6 w-24 animate-pulse rounded-full bg-bg-elevated" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && users && users.length === 0 && (
          <div className="px-6 py-12 text-center text-text-muted">
            No users found
          </div>
        )}

        {!isLoading && users && users.length > 0 && (
          <div className="divide-y divide-border">
            {users
              .slice()
              .sort((a: any, b: any) => {
                if (a.isAdmin === 'master') {
                  return -1;
                }
                if (b.isAdmin === 'master') {
                  return 1;
                }
                return 0;
              })
              .map(user => (
                <div
                  key={user?._id}
                  className="grid grid-cols-[1fr_1fr_120px_180px] items-center gap-4 px-6 py-4 transition-colors hover:bg-bg-elevated"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user.name || user.email}
                        width={36}
                        height={36}
                        className="h-9 w-9 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-body font-semibold text-black">
                        {user.name?.[0]?.toUpperCase() ??
                          user.email?.[0]?.toUpperCase() ??
                          '?'}
                      </div>
                    )}
                    <span className="truncate text-body font-medium text-text-primary">
                      {user.name || '—'}
                    </span>
                  </div>

                  <span className="truncate text-body text-text-secondary">
                    {user.email}
                  </span>

                  <RoleBadge isAdmin={user.isAdmin} />

                  <div className="flex items-center justify-end gap-2">
                    <RoleActions
                      currentRole={user.isAdmin}
                      userId={user._id}
                      currentUserId={currentUser?._id ?? ''}
                      onChange={role =>
                        handleUpdateRole(user._id, role as 'normal' | 'master')
                      }
                      isUpdating={isUpdatingRole}
                    />
                    {user.isAdmin !== 'master' && (
                      <>
                        <button
                          onClick={() => setEditingUser(user)}
                          title="Edit information"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-highlight hover:text-text-primary"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {user._id !== currentUser?._id && (
                          <button
                            onClick={() => setDeletingUser(user)}
                            title="Delete user"
                            className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-danger/20 hover:text-danger"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={() => {}}
          onSubmit={async payload => {
            const body: IUpdateUserBody = {
              name: payload.name,
              birthdate: payload.birthdate || null,
              gender: (payload.gender || null) as
                'male' | 'female' | 'other' | null,
            };
            await handleUpdateUser(payload.userId, body);
          }}
          isSaving={isUpdatingUser}
        />
      )}

      <ConfirmDialog
        open={!!deletingUser}
        onOpenChange={open => !open && setDeletingUser(null)}
        title="Delete user"
        description={`Are you sure you want to delete user "${deletingUser?.name || deletingUser?.email}"?\nAll tracks, groups, albums of this user will be deleted.`}
        confirmLabel={isDeletingUser ? 'Deleting...' : 'Delete'}
        onConfirm={() => {
          if (!deletingUser) {
            return;
          }
          handleDeleteUser(deletingUser._id);

          setDeletingUser(null);
        }}
      />
    </div>
  );
}
