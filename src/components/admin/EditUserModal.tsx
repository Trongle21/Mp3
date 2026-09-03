'use client';

import { useEditUserModal } from '@/hooks';
import type { IUser } from '@/interfaces/user.interface';
import { X } from 'lucide-react';

export interface IEditUserModalProps {
  user: IUser;
  onClose: () => void;
  onSave: (updated: IUser) => void;
  onSubmit: (payload: {
    userId: string;
    name: string;
    birthdate: string;
    gender: string;
  }) => Promise<void>;
  isSaving: boolean;
}

export function EditUserModal(props: IEditUserModalProps) {
  const { user, onClose, isSaving } = props;

  const { form, handleSave, setForm } = useEditUserModal(props);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-bg-secondary p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-h3 font-semibold text-text-primary">
            Edit user: {user.name || user.email}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:bg-bg-highlight hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1 block text-caption font-medium text-text-secondary">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-body text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="User's name"
            />
          </div>

          {/* Email — display only, not editable */}
          <div>
            <label className="mb-1 block text-caption font-medium text-text-secondary">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-border bg-bg-elevated px-3 py-2 text-body text-text-muted opacity-60"
            />
            <p className="mt-1 text-caption text-text-muted">
              🔒 Cannot be changed
            </p>
          </div>

          {/* Date of birth */}
          <div>
            <label className="mb-1 block text-caption font-medium text-text-secondary">
              Date of birth
            </label>
            <input
              type="date"
              value={form.birthdate}
              onChange={e => setForm({ ...form, birthdate: e.target.value })}
              className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-body text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="mb-1 block text-caption font-medium text-text-secondary">
              Gender
            </label>
            <select
              value={form.gender}
              onChange={e => setForm({ ...form, gender: e.target.value })}
              className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-body text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">—</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-body font-medium text-text-secondary transition-colors hover:bg-bg-highlight hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-accent px-4 py-2 text-body font-semibold text-white transition-colors hover:brightness-110 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
