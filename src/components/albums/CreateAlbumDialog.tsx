"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePicker } from "@/components/shared/ImagePicker";
import { createAlbum, uploadAlbumThumbnail } from "@/lib/api-albums";

interface CreateAlbumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAlbumDialog({ open, onOpenChange }: CreateAlbumDialogProps) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [genre, setGenre] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) {
      setTitle("");
      setArtist("");
      setDescription("");
      setYear("");
      setGenre("");
      setThumbnailFile(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const { data: created } = await createAlbum({
        title: trimmed,
        artist: artist.trim() || undefined,
        description: description.trim() || undefined,
        year: year ? parseInt(year, 10) : null,
        genre: genre.trim() || undefined,
      });

      if (thumbnailFile) {
        try {
          await uploadAlbumThumbnail(created.data._id, thumbnailFile);
        } catch (err) {
          console.warn("Thumbnail upload failed:", err);
          toast.warning("Album created, but the cover image couldn't be saved.");
        }
      }

      queryClient.invalidateQueries({ queryKey: ["albums"] });
      toast.success("Album created");
      onOpenChange(false);
    } catch {
      toast.error("Couldn't create album");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 animate-fade-slide-in" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-bg-secondary p-6 animate-fade-slide-in mx-4 max-h-[90vh] overflow-y-auto"
          style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        >
          <Dialog.Title className="text-h3 text-text-primary">New Album</Dialog.Title>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <Input
              autoFocus
              placeholder="Album title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              placeholder="Artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
            />
            <Input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex gap-3">
              <Input
                placeholder="Year (e.g. 2026)"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-28"
              />
              <Input
                placeholder="Genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="flex-1"
              />
            </div>
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
              <Button type="submit" disabled={!title.trim() || submitting}>
                {submitting ? "Creating…" : "Create"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
