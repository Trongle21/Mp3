"use client";

import { useState } from "react";
import type { Track } from "@/interfaces/track.interface";
import { TrackRow } from "./TrackRow";
import { TrackContextMenu } from "./TrackContextMenu";
import { EditTrackDialog } from "./EditTrackDialog";
import { usePlayer } from "@/hooks/usePlayer";

export function TrackList({
  tracks,
  isAdmin,
  onCoverUpload,
}: {
  tracks: Track[];
  isAdmin?: boolean;
  onCoverUpload?: (track: Track, file: File) => Promise<void>;
}) {
  const { currentTrack, isPlaying, play, toggle, setQueue } = usePlayer();
  const [menuFor, setMenuFor] = useState<{ track: Track; x: number; y: number } | null>(null);
  const [editTrack, setEditTrack] = useState<Track | null>(null);

  const handlePlay = (track: Track) => {
    if (currentTrack?._id === track._id) {
      toggle();
      return;
    }
    setQueue(tracks);
    play(track);
  };

  const openMenu = (track: Track, e: React.MouseEvent) => {
    e.preventDefault();
    setMenuFor({ track, x: e.clientX, y: e.clientY });
  };

  return (
    <div onContextMenu={(e) => e.preventDefault()}>
      {/* Desktop header: full columns */}
      <div className="hidden grid-cols-[32px_1fr_1fr_80px_auto] items-center gap-4 border-b border-border px-3 pb-2 text-caption text-text-muted lg:grid">
        <span>#</span>
        <span>Title</span>
        <span>Album</span>
        <span>Duration</span>
        <span />
      </div>

      <div className="mt-1">
        {tracks.map((track, index) => (
          <div key={track._id} onContextMenu={(e) => openMenu(track, e)}>
            <TrackRow
              track={track}
              index={index}
              isActive={currentTrack?._id === track._id}
              isPlaying={isPlaying}
              isAdmin={isAdmin}
              onPlay={() => handlePlay(track)}
              onOpenMenu={(e) => openMenu(track, e)}
              onCoverUpload={onCoverUpload}
            />
          </div>
        ))}
      </div>

      {menuFor && (
        <TrackContextMenu
          track={menuFor.track}
          x={menuFor.x}
          y={menuFor.y}
          onClose={() => setMenuFor(null)}
          onEdit={() => setEditTrack(menuFor.track)}
        />
      )}

      {editTrack && (
        <EditTrackDialog
          open={true}
          onOpenChange={(open) => { if (!open) setEditTrack(null); }}
          track={editTrack}
        />
      )}
    </div>
  );
}