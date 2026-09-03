'use client';

import { useAvatarSection } from '@/hooks';
import { cn } from '@/lib/utils';
import { Camera, Trash2, User } from 'lucide-react';

export interface IAvatarSectionProps {
  avatarUrl: string | null;
  handleUploadAvatar: (file: File) => void;
  handleDeleteAvatar: () => void;
  isLoading?: boolean;
}

export function AvatarSection(props: IAvatarSectionProps) {
  const { avatarUrl, isLoading, handleDeleteAvatar } = props;

  const { inputRef, handleFileChange } = useAvatarSection(props);

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
            onClick={handleDeleteAvatar}
            disabled={isLoading}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-4 py-2 text-caption font-medium text-danger transition-colors hover:bg-danger/10 disabled:opacity-50'
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
