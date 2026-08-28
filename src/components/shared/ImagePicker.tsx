"use client";

import { useRef, useState, useEffect } from "react";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import {
  acceptImageFile,
  formatFileSize,
  imageValidationMessage,
  validateImageFile,
} from "@/lib/image-upload";

interface ImagePickerProps {
  /** Currently selected file (controlled). */
  file: File | null;
  onChange: (file: File | null) => void;
  /** Optional label shown above the picker. */
  label?: string;
  /** Required MIME types override (defaults to JPEG/PNG/WebP/GIF). */
  accept?: string;
  /** Preview size in pixels. Defaults to 96. */
  size?: number;
  disabled?: boolean;
  /**
   * When provided, shows this URL as the existing image behind the picker button.
   * When a new `file` is selected, the preview switches to the local object URL.
   */
  src?: string | null;
}

function ObjectUrlPreview({ src }: { src: string }) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const apply = (file: File) => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
  };

  return (
    <div
      style={{ backgroundImage: `url(${objectUrl ?? src})` }}
      className="h-full w-full bg-cover bg-center"
    />
  );
}

/**
 * A small image picker with preview + clear. Validates type and size up-front
 * and surfaces errors via toast. Object URL is created lazily and revoked on
 * unmount or file change so we never leak.
 */
export function ImagePicker({
  file,
  onChange,
  label = "Cover image (optional)",
  accept = "image/jpeg,image/png,image/webp,image/gif",
  size = 96,
  disabled,
  src,
}: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleSelect = (selected: File | undefined) => {
    if (!selected) return;
    const err = validateImageFile(selected);
    if (err) {
      toast.error(imageValidationMessage(err));
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    onChange(selected);
  };

  const handleClear = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <p className="text-caption text-text-secondary">{label}</p>

      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="flex w-full items-center gap-3 rounded-lg border border-dashed border-border bg-bg-elevated px-3 py-2 text-left text-caption text-text-secondary transition-colors hover:border-text-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          {src ? (
            <div
              className="shrink-0 overflow-hidden rounded"
              style={{ width: size, height: size }}
            >
              {/* Blob URLs from local files aren't optimized by next/image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt="Current"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div
              className="flex shrink-0 items-center justify-center rounded bg-bg-highlight"
              style={{ width: size, height: size }}
            >
              <ImagePlus className="h-5 w-5 text-text-muted" />
            </div>
          )}
          <span>Change image…</span>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            disabled={disabled}
            onChange={(e) => handleSelect(e.target.files?.[0])}
          />
        </button>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-bg-elevated p-2">
          <div
            className="shrink-0 overflow-hidden rounded bg-bg-highlight"
            style={{ width: size, height: size }}
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-body text-text-primary">{file.name}</p>
            <p className="text-caption text-text-muted">
              {formatFileSize(file.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            aria-label="Remove image"
            className="rounded-full p-2 text-text-muted hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
