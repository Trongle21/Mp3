import type { IEditTrackDialogProps } from '@/components';
import {
  useGetAlbumListQuery,
  useUpdateTrackMutation,
  useUploadTrackCoverMutation,
} from '@/services';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const useEditTrackDialog = (props: IEditTrackDialogProps) => {
  const { open, onOpenChange, track } = props;

  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist);
  const [albumId, setAlbumId] = useState(
    typeof track.album === 'string' ? track.album : ''
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: albumsData } = useGetAlbumListQuery({ limit: 100 });

  const { mutateAsync: updateTrack } = useUpdateTrackMutation();
  const { mutateAsync: uploadTrackCover } = useUploadTrackCoverMutation();

  // Sync state when the track prop changes (e.g., opening dialog for a different track).
  useEffect(() => {
    if (open) {
      setTitle(track.title);
      setArtist(track.artist);
      setCoverFile(null);
    }
  }, [open, track]);

  // Resolve the current albumId once album list is available.
  // Fallback to title-match for legacy data where track.album stored the album name.
  useEffect(() => {
    if (!open) {
      return;
    }
    const raw = typeof track.album === 'string' ? track.album : '';
    if (!raw) {
      setAlbumId('');
      return;
    }
    const byId = albumsData?.find(a => a._id === raw);
    const byTitle = !byId ? albumsData?.find(a => a.title === raw) : undefined;
    setAlbumId(byId?._id ?? byTitle?._id ?? raw);
  }, [open, track.album, albumsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    setSubmitting(true);
    try {
      // Step 1: update text metadata.
      const hasMetaChanges =
        trimmedTitle !== track.title.trim() ||
        artist.trim() !== track.artist.trim() ||
        albumId !== (typeof track.album === 'string' ? track.album : '');

      if (hasMetaChanges) {
        await updateTrack({
          trackId: track._id,
          body: {
            title: trimmedTitle,
            artist: artist.trim(),
            album: albumId,
          },
        });
      }

      // Step 2: upload new cover if changed (best-effort).
      if (coverFile) {
        try {
          await uploadTrackCover({ trackId: track._id, file: coverFile });
        } catch (err) {
          console.warn('Cover upload failed:', err);
          toast.warning(
            "Metadata saved, but the cover image couldn't be updated."
          );
        }
      }

      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      queryClient.invalidateQueries({ queryKey: ['track', track._id] });
      toast.success('Track updated');
      onOpenChange(false);
    } catch {
      toast.error("Couldn't update track");
    } finally {
      setSubmitting(false);
    }
  };

  return {
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
  };
};
