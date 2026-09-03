'use client';

import { ImagePicker } from '@/components/shared/ImagePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEditAlbumDialog } from '@/hooks';
import type { IAlbumListItem } from '@/interfaces/album.interface';
import * as Dialog from '@radix-ui/react-dialog';

export interface IEditAlbumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  album: IAlbumListItem;
}

export function EditAlbumDialog(props: IEditAlbumDialogProps) {
  const { open, onOpenChange, album } = props;

  const {
    handleSubmit,
    title,
    setTitle,
    artist,
    setArtist,
    description,
    setDescription,
    year,
    setYear,
    genre,
    setGenre,
    thumbnailFile,
    setThumbnailFile,
    isSubmitting,
  } = useEditAlbumDialog(props);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 animate-fade-slide-in" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-bg-secondary p-6 animate-fade-slide-in mx-4 max-h-[90vh] overflow-y-auto"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          <Dialog.Title className="text-h3 text-text-primary">
            Edit Album
          </Dialog.Title>
          <form
            className="mt-4 space-y-4"
            onSubmit={handleSubmit}
          >
            <Input
              autoFocus
              placeholder="Album title *"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <Input
              placeholder="Artist"
              value={artist}
              onChange={e => setArtist(e.target.value)}
            />
            <Input
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <div className="flex gap-3">
              <Input
                placeholder="Year"
                type="number"
                value={year}
                onChange={e => setYear(e.target.value)}
                className="w-28"
              />
              <Input
                placeholder="Genre"
                value={genre}
                onChange={e => setGenre(e.target.value)}
                className="flex-1"
              />
            </div>
            <ImagePicker
              file={thumbnailFile}
              onChange={setThumbnailFile}
              label="Cover image"
              disabled={isSubmitting}
              src={album.thumbnailUrl}
            />
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                disabled={!title.trim() || isSubmitting}
              >
                {isSubmitting ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
