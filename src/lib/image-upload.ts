import { toast } from "sonner";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export type ImageValidationError =
  | { kind: "type"; got: string }
  | { kind: "size"; size: number; max: number }
  | null;

/**
 * Validate a candidate image file. Returns null when valid, otherwise a
 * structured error. Caller decides how to surface it (toast, inline error…).
 */
export function validateImageFile(file: File): ImageValidationError {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return { kind: "type", got: file.type };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { kind: "size", size: file.size, max: MAX_IMAGE_SIZE };
  }
  return null;
}

export function imageValidationMessage(err: NonNullable<ImageValidationError>): string {
  if (err.kind === "type") {
    return "Only JPEG, PNG, WebP, or GIF images are allowed.";
  }
  const mb = (err.size / 1024 / 1024).toFixed(1);
  const maxMb = (err.max / 1024 / 1024).toFixed(0);
  return `Image is ${mb}MB; the max is ${maxMb}MB.`;
}

/** Convenience wrapper: validates and toasts on failure. Returns true if usable. */
export function acceptImageFile(file: File): boolean {
  const err = validateImageFile(file);
  if (err) {
    toast.error(imageValidationMessage(err));
    return false;
  }
  return true;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}