"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useTracks } from "@/hooks/useTracks";
import { useAddTrackToAlbum } from "@/hooks/useAlbums";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface AddTracksToAlbumModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  albumId: string;
  existingTrackIds: string[];
}

export function AddTracksToAlbumModal({
  open,
  onOpenChange,
  albumId,
  existingTrackIds,
}: AddTracksToAlbumModalProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const { data, isLoading } = useTracks({ search: debouncedSearch || undefined });
  const addTrack = useAddTrackToAlbum(albumId);

  const tracks = (data?.data ?? []).filter((t) => !existingTrackIds.includes(t._id));

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 animate-fade-slide-in" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 flex h-[70vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border border-border bg-bg-secondary p-6 animate-fade-slide-in mx-4"
          style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-h3 text-text-primary">Add tracks</Dialog.Title>
            <Dialog.Close className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-bg-highlight hover:text-text-primary">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              autoFocus
              placeholder="Search your library"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading && <p className="py-6 text-center text-caption text-text-muted">Searching…</p>}
            {!isLoading && tracks.length === 0 && (
              <p className="py-6 text-center text-caption text-text-muted">No tracks to add</p>
            )}
            {tracks.map((track) => (
              <div
                key={track._id}
                className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-bg-elevated"
              >
                <div className="min-w-0">
                  <p className="truncate text-body text-text-primary">{track.title}</p>
                  <p className="truncate text-caption text-text-secondary">{track.artist}</p>
                </div>
                <button
                  onClick={() =>
                    addTrack.mutate(track._id, {
                      onSuccess: (_, __, context) => {
                        const msg = context as unknown as { message?: string } | undefined;
                        if (msg?.message === "Track already in album") {
                          toast.info("Track already in album");
                        } else {
                          toast.success(`Added "${track.title}"`);
                        }
                      },
                      onError: () => toast.error("Couldn't add track"),
                    })
                  }
                  aria-label={`Add ${track.title}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-accent hover:bg-accent-dim"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
