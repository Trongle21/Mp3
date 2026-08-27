"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { User } from "@/interfaces/user.interface";

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSave: (updated: User) => void;
  onSubmit: (payload: { userId: string; name: string; birthdate: string; gender: string }) => Promise<void>;
  isSaving: boolean;
}

export function EditUserModal({ user, onClose, onSave, onSubmit, isSaving }: EditUserModalProps) {
  const [form, setForm] = useState({
    name: user.name ?? "",
    birthdate: user.birthdate ? user.birthdate.split("T")[0] : "",
    gender: user.gender ?? "",
  });

  const handleSave = async () => {
    await onSubmit({
      userId: user._id,
      name: form.name,
      birthdate: form.birthdate,
      gender: form.gender,
    });
    onSave({ ...user, ...form, birthdate: form.birthdate || null, gender: form.gender || null });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-bg-secondary p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-h3 font-semibold text-text-primary">
            Sửa thông tin: {user.name || user.email}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:bg-bg-highlight hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Tên */}
          <div>
            <label className="mb-1 block text-caption font-medium text-text-secondary">
              Tên
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-body text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="Tên người dùng"
            />
          </div>

          {/* Email — chỉ hiển thị, không cho sửa */}
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
            <p className="mt-1 text-caption text-text-muted">🔒 Không thể thay đổi</p>
          </div>

          {/* Ngày sinh */}
          <div>
            <label className="mb-1 block text-caption font-medium text-text-secondary">
              Ngày sinh
            </label>
            <input
              type="date"
              value={form.birthdate}
              onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
              className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-body text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Giới tính */}
          <div>
            <label className="mb-1 block text-caption font-medium text-text-secondary">
              Giới tính
            </label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-body text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">—</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-body font-medium text-text-secondary transition-colors hover:bg-bg-highlight hover:text-text-primary"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-accent px-4 py-2 text-body font-semibold text-white transition-colors hover:brightness-110 disabled:opacity-50"
          >
            {isSaving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}
