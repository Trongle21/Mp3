"use client";

import { useRef, useState } from "react";
import type { Track } from "@/interfaces/track.interface";
import { formatDuration } from "@/lib/utils";
import {
  MoreHorizontal,
  Pause,
  Play,
  Pencil,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { CoverThumb } from "../shared/CoverThumb";
import { EditTrackDialog } from "./EditTrackDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useDeleteTrack } from "@/hooks/useTracks";
import { toast } from "sonner";

interface TrackRowProps {
  track: Track;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  isAdmin?: boolean;
  onPlay: () => void;
  onOpenMenu: (e: React.MouseEvent) => void;
  onCoverUpload?: (track: Track, file: File) => Promise<void>;
}

export function TrackRow({
  track,
  index,
  isActive,
  isPlaying,
  isAdmin,
  onPlay,
  onOpenMenu,
  onCoverUpload,
}: TrackRowProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const deleteTrack = useDeleteTrack();

  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onCoverUpload) return;
    setShowCoverPicker(false);
    try {
      await onCoverUpload(track, file);
    } catch {
      toast.error("Couldn't upload cover");
    }
    if (coverInputRef.current) coverInputRef.current.value = "";
  };
  return (
    <>
      <div
        onDoubleClick={onPlay}
        className="group grid items-center gap-3 rounded-md px-3 py-2 text-body transition-colors hover:bg-bg-elevated sm:gap-4 grid-cols-[40px_1fr_1fr_80px_auto] md:grid-cols-[32px_1fr_1fr_80px_auto]"
      >
        <button
          onClick={onPlay}
          aria-label={isActive && isPlaying ? "Pause" : "Play"}
          className="flex h-6 w-6 items-center justify-center text-text-secondary"
        >
          <span className="group-hover:hidden">
            {isActive && isPlaying ? (
              <span className="text-accent">▶</span>
            ) : (
              <span className={isActive ? "text-accent" : "text-text-muted"}>
                {index + 1}
              </span>
            )}
          </span>
          <span className="hidden group-hover:block text-text-primary">
            {isActive && isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </span>
        </button>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <CoverThumb
            src={track.coverUrl}
            title={track.title}
            size={40}
            className="rounded"
          />
          <div className="min-w-0 flex-1">
            <p
              className={`truncate w-full font-medium ${isActive ? "text-accent" : "text-text-primary"}`}
            >
              {track.title}
            </p>
            <p className="truncate text-caption text-text-secondary">
              {track.artist}
            </p>
          </div>
        </div>

        <p className=" truncate text-caption text-text-secondary">
          {typeof track.album === "string"
            ? track.album
            : ((track.album as { title?: string })?.title ?? "")}
        </p>
        <p className=" text-caption text-text-secondary">
          {formatDuration(track.durationSec)}
        </p>

        <div className="relative">
          <button
            onClick={onOpenMenu}
            aria-label="More options"
            className="flex h-8 w-8 items-center justify-center text-text-primary opacity-100 transition-opacity hover:opacity-70"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isAdmin && (
        <div className="ml-auto mr-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => setShowEdit(true)}
            title="Edit"
            className="flex h-7 w-7 items-center justify-center rounded text-text-muted hover:bg-bg-highlight hover:text-text-primary"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setShowCoverPicker(true)}
            title="Change cover"
            className="flex h-7 w-7 items-center justify-center rounded text-text-muted hover:bg-bg-highlight hover:text-text-primary"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setShowDelete(true)}
            title="Delete"
            className="flex h-7 w-7 items-center justify-center rounded text-text-muted hover:bg-bg-highlight hover:text-danger"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverFile}
        className="hidden"
      />

      {showCoverPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-bg-elevated p-6 shadow-xl">
            <p className="text-body font-medium text-text-primary">
              Change cover for &quot;{track.title}&quot;
            </p>
            <button
              onClick={() => coverInputRef.current?.click()}
              className="rounded-lg bg-accent px-4 py-2 text-body font-semibold text-black transition-colors hover:bg-accent-hover"
            >
              Choose file...
            </button>
            <button
              onClick={() => {
                setShowCoverPicker(false);
                if (coverInputRef.current) coverInputRef.current.value = "";
              }}
              className="text-caption text-text-muted hover:text-text-primary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <EditTrackDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        track={track}
      />

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete track"
        description={`"${track.title}" will be permanently removed from your library.`}
        confirmLabel="Delete"
        onConfirm={() =>
          deleteTrack.mutate(track._id, {
            onSuccess: () => toast.success("Track deleted"),
            onError: () => toast.error("Couldn't delete track"),
          })
        }
      />
    </>
  );
}
