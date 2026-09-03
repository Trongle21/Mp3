'use client';

import { ImagePicker } from '@/components/shared/ImagePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEditTrackDialog } from '@/hooks';
import type { ITrack } from '@/interfaces/track.interface';
import * as Dialog from '@radix-ui/react-dialog';

export interface IEditTrackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  track: ITrack;
}

export function EditTrackDialog(props: IEditTrackDialogProps) {
  const { open, onOpenChange, track } = props;
  const {
    handleSubmit,
    title,
    setTitle,
    artist,
    setArtist,
    albumId,
    setAlbumId,
    coverFile,
    setCoverFile,
    submitting,
    albumsData,
  } = useEditTrackDialog(props);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 animate-fade-slide-in" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-bg-secondary p-6 animate-fade-slide-in mx-4"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          <Dialog.Title className="text-h3 text-text-primary">
            Edit track
          </Dialog.Title>
          <form
            className="mt-4 space-y-4"
            onSubmit={handleSubmit}
          >
            <Input
              autoFocus
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={submitting}
            />
            <Input
              placeholder="Artist"
              value={artist}
              onChange={e => setArtist(e.target.value)}
              disabled={submitting}
            />
            <div className="space-y-1.5">
              <p className="text-caption text-text-secondary">Album (optional)</p>
              <select
                value={albumId}
                onChange={e => setAlbumId(e.target.value)}
                disabled={submitting}
                className="flex h-11 w-full cursor-pointer rounded-md border border-border bg-bg-elevated px-3 text-body text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">No album</option>
                {albumsData?.map(album => (
                  <option
                    key={album._id}
                    value={album._id}
                  >
                    {album.title} {album.artist ? `— ${album.artist}` : ''}
                  </option>
                ))}
              </select>
            </div>
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
                <Button
                  type="button"
                  variant="ghost"
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                disabled={!title.trim() || submitting}
              >
                {submitting ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
