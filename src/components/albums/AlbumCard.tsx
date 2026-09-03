'use client';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useAlbumCard } from '@/hooks';
import type { IAlbumListItem } from '@/interfaces';
import { formatDuration } from '@/lib/utils';
import { Disc, MoreHorizontal, Pencil, Play, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { EditAlbumDialog } from './EditAlbumDialog';

export interface IAlbumCardProps {
  album: IAlbumListItem;
}

export function AlbumCard(props: IAlbumCardProps) {
  const { album } = props;

  const {
    playAll,
    menuOpen,
    setMenuOpen,
    showDelete,
    setShowDelete,
    showEdit,
    setShowEdit,
    handleDeleteAlbum,
  } = useAlbumCard(props);

  return (
    <>
      <div className="group relative rounded-lg p-3 transition-colors hover:bg-bg-elevated">
        <Link href={`/albums/${album._id}`}>
          <div className="relative aspect-square overflow-hidden rounded-md bg-bg-highlight">
            {album.thumbnailUrl ? (
              <Image
                src={album.thumbnailUrl}
                alt={album.title}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-bg-highlight to-bg-elevated text-text-muted">
                <Disc className="h-12 w-12 text-text-secondary" />
              </div>
            )}
          </div>
          <p className="mt-3 truncate text-body font-medium text-text-primary">
            {album.title}
          </p>
          <p className="text-caption text-text-secondary">
            {album.artist || 'Unknown Artist'}
            {album.year ? ` · ${album.year}` : ''}
          </p>
          <p className="text-caption text-text-muted">
            {album.trackCount} tracks · {formatDuration(album.totalDuration)}
          </p>
        </Link>

        <button
          onClick={e => {
            e.preventDefault();
            playAll();
          }}
          aria-label={`Play ${album.title}`}
          className="absolute bottom-16 right-5 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-accent text-black opacity-0 shadow-lg transition-all hover:scale-105 hover:bg-accent-hover group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Play className="ml-0.5 h-4 w-4" />
        </button>

        <button
          onClick={e => {
            e.preventDefault();
            setMenuOpen(v => !v);
          }}
          aria-label="Album options"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-bg-primary/70 text-text-secondary opacity-0 transition-opacity hover:text-text-primary group-hover:opacity-100"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-3 top-11 z-10 w-40 rounded-lg border border-border bg-bg-elevated py-1 shadow-xl">
            <button
              onClick={() => {
                setShowEdit(true);
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-caption text-text-primary hover:bg-bg-highlight"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              onClick={() => {
                setShowDelete(true);
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-caption text-danger hover:bg-bg-highlight"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>

      <EditAlbumDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        album={album}
      />

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete album"
        description={`"${album.title}" will be deleted. Tracks stay in your library.`}
        confirmLabel="Delete"
        onConfirm={() => handleDeleteAlbum(album._id)}
      />
    </>
  );
}
