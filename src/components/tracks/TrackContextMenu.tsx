"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2, ListPlus } from "lucide-react";
import { toast } from "sonner";
import type { Track } from "@/interfaces/track.interface";
import { useDeleteTrack } from "@/hooks/useTracks";
import { useGroups, useAddTrackToGroup } from "@/hooks/useGroups";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

interface TrackContextMenuProps {
  track: Track;
  x: number;
  y: number;
  onClose: () => void;
  onEdit: () => void;
}

export function TrackContextMenu({ track, x, y, onClose, onEdit }: TrackContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [showGroups, setShowGroups] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const { data: groups } = useGroups();
  const deleteTrack = useDeleteTrack();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const menuStyle = {
    top: Math.min(y, window.innerHeight - 220),
    left: Math.min(x, window.innerWidth - 220),
  };

  return (
    <>
      <div
        ref={ref}
        style={menuStyle}
        className="fixed z-30 w-52 rounded-lg border border-border bg-bg-elevated py-1 shadow-xl animate-fade-slide-in"
      >
        {!showGroups && (
          <>
            <MenuItem icon={Pencil} label="Edit" onClick={onEdit} />
            <MenuItem icon={ListPlus} label="Add to group" onClick={() => setShowGroups(true)} />
            <MenuItem
              icon={Trash2}
              label="Delete"
              danger
              onClick={() => {
                setShowDelete(true);
                onClose();
              }}
            />
          </>
        )}

        {showGroups && (
          <div className="max-h-48 overflow-y-auto">
            {(groups ?? []).length === 0 && (
              <p className="px-3 py-2 text-caption text-text-muted">No groups yet</p>
            )}
            {(groups ?? []).map((group) => (
              <AddToGroupItem
                key={group._id}
                groupId={group._id}
                name={group.name}
                trackId={track._id}
                onDone={onClose}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete track"
        description={`"${track.title}" will be permanently removed from your library.`}
        confirmLabel="Delete"
        onConfirm={() => {
          deleteTrack.mutate(track._id, {
            onSuccess: () => toast.success("Track deleted"),
            onError: () => toast.error("Couldn't delete track"),
          });
        }}
      />
    </>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-caption transition-colors hover:bg-bg-highlight ${
        danger ? "text-danger" : "text-text-primary"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function AddToGroupItem({
  groupId,
  name,
  trackId,
  onDone,
}: {
  groupId: string;
  name: string;
  trackId: string;
  onDone: () => void;
}) {
  const addTrack = useAddTrackToGroup(groupId);
  return (
    <button
      onClick={() =>
        addTrack.mutate(trackId, {
          onSuccess: () => {
            toast.success(`Added to ${name}`);
            onDone();
          },
          onError: () => toast.error("Couldn't add track to group"),
        })
      }
      className="flex w-full items-center px-3 py-2 text-left text-caption text-text-primary transition-colors hover:bg-bg-highlight"
    >
      {name}
    </button>
  );
}