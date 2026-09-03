'use client';

import { useTrackList } from '@/hooks';
import type { ITrack } from '@/interfaces/track.interface';
import { EditTrackDialog } from './EditTrackDialog';
import { TrackContextMenu } from './TrackContextMenu';
import { TrackRow } from './TrackRow';

export interface ITrackListProps {
  tracks: ITrack[];
  isAdmin?: boolean;
  onCoverUpload?: (track: ITrack, file: File) => Promise<void>;
}

export const TrackList = (props: ITrackListProps) => {
  const { tracks, isAdmin, onCoverUpload } = props;

  const {
    handlePlay,
    openMenu,
    menuFor,
    editTrack,
    setEditTrack,
    isPlaying,
    currentTrack,
    setMenuFor,
  } = useTrackList(props);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div onContextMenu={e => e.preventDefault()}>
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
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions
          <div
            key={track._id}
            onContextMenu={e => openMenu(track, e)}
          >
            <TrackRow
              track={track}
              index={index}
              isActive={currentTrack?._id === track._id}
              isPlaying={isPlaying}
              isAdmin={isAdmin}
              onPlay={() => handlePlay(track)}
              onOpenMenu={e => openMenu(track, e)}
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
          onOpenChange={open => {
            if (!open) {
              setEditTrack(null);
            }
          }}
          track={editTrack}
        />
      )}
    </div>
  );
};
