"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from "@/interfaces/user.interface";

interface ProfileFormProps {
  user: User;
  onSave: (fields: { name: string; birthdate: string | null; gender: "male" | "female" | "other" | null }) => Promise<void>;
  isSaving?: boolean;
}

const genderOptions: { label: string; value: "male" | "female" | "other" | null }[] = [
  { label: "Chưa rõ", value: null },
  { label: "Nam", value: "male" },
  { label: "Nữ", value: "female" },
  { label: "Khác", value: "other" },
];

export function ProfileForm({ user, onSave, isSaving }: ProfileFormProps) {
  const [name, setName] = useState(user.name);
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | null>(user.gender);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (user.birthdate) {
      setBirthdate(user.birthdate.split("T")[0]);
    } else {
      setBirthdate("");
    }
  }, [user.birthdate]);

  const handleNameChange = (v: string) => {
    setName(v);
    setDirty(v.trim() !== user.name || birthdate !== (user.birthdate?.split("T")[0] ?? "") || gender !== user.gender);
  };

  const handleBirthdateChange = (v: string) => {
    setBirthdate(v);
    setDirty(name.trim() !== user.name || v !== (user.birthdate?.split("T")[0] ?? "") || gender !== user.gender);
  };

  const handleGenderChange = (v: "male" | "female" | "other" | null) => {
    setGender(v);
    setDirty(name.trim() !== user.name || birthdate !== (user.birthdate?.split("T")[0] ?? "") || v !== user.gender);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    await onSave({
      name: trimmedName,
      birthdate: birthdate || null,
      gender,
    });
    setDirty(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-caption font-medium text-text-secondary">Email</label>
        <Input
          value={user.email}
          readOnly
          disabled
          className="cursor-not-allowed opacity-60"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-caption font-medium text-text-secondary">Tên hiển thị</label>
        <Input
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          maxLength={200}
          placeholder="Your display name"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-caption font-medium text-text-secondary">Ngày sinh</label>
        <Input
          type="date"
          value={birthdate}
          onChange={(e) => handleBirthdateChange(e.target.value)}
          className="[color-scheme:dark]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-caption font-medium text-text-secondary">Giới tính</label>
        <select
          value={gender ?? ""}
          onChange={(e) => handleGenderChange((e.target.value || null) as "male" | "female" | "other" | null)}
          className="h-11 w-full rounded-md border border-border bg-bg-elevated px-3 text-body text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {genderOptions.map((opt) => (
            <option key={opt.label} value={opt.value ?? ""}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {dirty && (
        <Button type="submit" disabled={isSaving} className="self-start">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      )}
    </form>
  );
}
