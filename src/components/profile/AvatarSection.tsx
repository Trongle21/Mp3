"use client";

import { useRef } from "react";
import { User, Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AvatarSectionProps {
  avatarUrl: string | null;
  onUpload: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
  isLoading?: boolean;
}

export function AvatarSection({ avatarUrl, onUpload, onDelete, isLoading }: AvatarSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    try {
      await onUpload(file);
    } catch {
      // error handled by hook
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDelete = async () => {
    try {
      await onDelete();
    } catch {
      // error handled by hook
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className="group/avatar relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-bg-elevated ring-2 ring-border transition-shadow hover:ring-accent disabled:opacity-50"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-14 w-14 text-text-muted" />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover/avatar:opacity-100">
            <Camera className="h-7 w-7 text-white" />
          </div>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-caption font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary disabled:opacity-50"
        >
          <Camera className="h-3.5 w-3.5" />
          Change photo
        </button>

        {avatarUrl && (
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-caption font-medium text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
