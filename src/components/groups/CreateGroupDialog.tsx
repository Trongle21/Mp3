"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePicker } from "@/components/shared/ImagePicker";
import { createGroup, uploadGroupThumbnail } from "@/lib/api-groups";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const [name, setName] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Reset state every time the dialog closes so reopening is clean.
  useEffect(() => {
    if (!open) {
      setName("");
      setThumbnailFile(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      // Step 1: create the group.
      const { data: created } = await createGroup(trimmed);

      // Step 2: upload the thumbnail (best-effort). The group itself is already
      // saved; failure here shouldn't roll back the creation.
      if (thumbnailFile) {
        try {
          await uploadGroupThumbnail(created.data._id, thumbnailFile);
        } catch (err) {
          console.warn("Thumbnail upload failed:", err);
          toast.warning("Group created, but the cover image couldn't be saved.");
        }
      }

      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Group created");
      onOpenChange(false);
    } catch {
      toast.error("Couldn't create group");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 animate-fade-slide-in" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-bg-secondary p-6 animate-fade-slide-in mx-4"
          style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        >
          <Dialog.Title className="text-h3 text-text-primary">New group</Dialog.Title>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <Input
              autoFocus
              placeholder="Group name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <ImagePicker
              file={thumbnailFile}
              onChange={setThumbnailFile}
              label="Cover image (optional)"
              disabled={submitting}
            />
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <Button type="button" variant="ghost" disabled={submitting}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={!name.trim() || submitting}>
                {submitting ? "Creating…" : "Create"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}