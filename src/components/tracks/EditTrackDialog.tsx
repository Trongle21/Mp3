"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePicker } from "@/components/shared/ImagePicker";
import { updateTrack, uploadTrackCover } from "@/lib/api-tracks";
import type { Track } from "@/interfaces/track.interface";

interface EditTrackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  track: Track;
}

export function EditTrackDialog({ open, onOpenChange, track }: EditTrackDialogProps) {
  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist);
  const [album, setAlbum] = useState(track.album);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Sync state when the track prop changes (e.g., opening dialog for a different track).
  useEffect(() => {
    if (open) {
      setTitle(track.title);
      setArtist(track.artist);
      setAlbum(track.album);
      setCoverFile(null);
    }
  }, [open, track]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setSubmitting(true);
    try {
      // Step 1: update text metadata.
      const hasMetaChanges =
        trimmedTitle !== track.title.trim() ||
        artist.trim() !== track.artist.trim() ||
        album.trim() !== track.album.trim();

      if (hasMetaChanges) {
        await updateTrack(track._id, {
          title: trimmedTitle,
          artist: artist.trim(),
          album: album.trim(),
        });
      }

      // Step 2: upload new cover if changed (best-effort).
      if (coverFile) {
        try {
          await uploadTrackCover(track._id, coverFile);
        } catch (err) {
          console.warn("Cover upload failed:", err);
          toast.warning("Metadata saved, but the cover image couldn't be updated.");
        }
      }

      queryClient.invalidateQueries({ queryKey: ["tracks"] });
      queryClient.invalidateQueries({ queryKey: ["track", track._id] });
      toast.success("Track updated");
      onOpenChange(false);
    } catch {
      toast.error("Couldn't update track");
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
          <Dialog.Title className="text-h3 text-text-primary">Edit track</Dialog.Title>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <Input
              autoFocus
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
            />
            <Input
              placeholder="Artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              disabled={submitting}
            />
            <Input
              placeholder="Album"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              disabled={submitting}
            />
            <ImagePicker
              file={coverFile}
              onChange={setCoverFile}
              label="Cover image"
              size={96}
              disabled={submitting}
              src={track.coverUrl}
            />
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <Button type="button" variant="ghost" disabled={submitting}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={!title.trim() || submitting}>
                {submitting ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}