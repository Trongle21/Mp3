/* eslint-disable jsx-a11y/no-static-element-interactions */
'use client';

import { MusicVisualizer } from '@/components/player/MusicVisualizer';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useTrackRow } from '@/hooks';
import type { ITrack } from '@/interfaces';
import { formatDuration } from '@/lib/utils';
import {
  Image as ImageIcon,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Trash2,
} from 'lucide-react';
import { CoverThumb } from '../shared/CoverThumb';
import { EditTrackDialog } from './EditTrackDialog';

export interface ITrackRowProps {
  track: ITrack;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  isAdmin?: boolean;
  onPlay: () => void;
  onOpenMenu: (e: React.MouseEvent) => void;
  onCoverUpload?: (track: ITrack, file: File) => Promise<void>;
}

export function TrackRow(props: ITrackRowProps) {
  const { track, index, isActive, isPlaying, isAdmin, onPlay, onOpenMenu } =
    props;

  const {
    showEdit,
    setShowEdit,
    showDelete,
    setShowDelete,
    showCoverPicker,
    setShowCoverPicker,
    coverInputRef,
    handleCoverFile,
    handleDeleteTrack,
  } = useTrackRow(props);
  return (
    <>
      <div
        onDoubleClick={onPlay}
        className="group grid items-center gap-3 rounded-md px-3 py-2 text-body transition-colors hover:bg-bg-elevated sm:gap-4 grid-cols-[32px_3fr_1fr_40px_auto] md:grid-cols-[32px_1fr_1fr_80px_auto]"
      >
        <button
          onClick={onPlay}
          aria-label={isActive && isPlaying ? 'Pause' : 'Play'}
          className="flex h-6 w-6 items-center justify-center text-text-secondary"
        >
          {isActive && isPlaying ? (
            <MusicVisualizer
              isPlaying={true}
              barCount={3}
            />
          ) : (
            <span className="group-hover:hidden">
              <span className={isActive ? 'text-accent' : 'text-text-muted'}>
                {index + 1}
              </span>
            </span>
          )}
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
              className={`truncate w-full font-medium ${isActive ? 'text-accent' : 'text-text-primary'}`}
            >
              {track.title}
            </p>
            <p className="truncate text-caption text-text-secondary">
              {track.artist}
            </p>
          </div>
        </div>

        <p className=" truncate text-caption text-text-secondary">
          {typeof track.album === 'string'
            ? track.album
            : ((track.album as { title?: string })?.title ?? '')}
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
                if (coverInputRef.current) {
                  coverInputRef.current.value = '';
                }
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
        onConfirm={() => handleDeleteTrack(track)}
      />
    </>
  );
}
