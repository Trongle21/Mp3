import type { IEditAlbumDialogProps } from '@/components';
import { ALBUM_QUERY_KEYS } from '@/constants';
import type { IAlbumBody } from '@/interfaces';
import {
  useUpdateAlbumMutation,
  useUploadAlbumThumbnailMutation,
} from '@/services';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export const useEditAlbumDialog = (props: IEditAlbumDialogProps) => {
  const { album, open, onOpenChange } = props;

  const [title, setTitle] = useState(album.title);
  const [artist, setArtist] = useState(album.artist);
  const [description, setDescription] = useState(album.description);
  const [year, setYear] = useState(album.year?.toString() ?? '');
  const [genre, setGenre] = useState(album.genre);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { mutateAsync: updateAlbum, isPending: isUpdatingAlbum } =
    useUpdateAlbumMutation({
      configs: {
        onSuccess: () => {
          toast.success('Album updated');
        },
        onError: () => {
          toast.error("Couldn't update album");
        },
      },
    });

  const { mutate: uploadAlbumThumbnail, isPending: isUploadingAlbumThumbnail } =
    useUploadAlbumThumbnailMutation({
      configs: {
        onSuccess: () => {
          toast.success('Thumbnail uploaded');

          queryClient.invalidateQueries({
            queryKey: [ALBUM_QUERY_KEYS.GET_ALBUMS],
          });

          onOpenChange(false);
        },
        onError: () => {
          toast.error('Thumbnail upload failed');
        },
      },
    });

  useEffect(() => {
    if (open) {
      setTitle(album.title);
      setArtist(album.artist);
      setDescription(album.description);
      setYear(album.year?.toString() ?? '');
      setGenre(album.genre);
      setThumbnailFile(null);
    }
  }, [open, album]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = title.trim();

      if (!trimmed) {
        return;
      }

      const body: IAlbumBody = {
        title: trimmed,
        artist: artist.trim() || undefined,
        description: description.trim() || undefined,
        year: year ? parseInt(year, 10) : null,
        genre: genre.trim() || undefined,
      };

      try {
        const response = await updateAlbum({ albumId: album._id, body });

        if (thumbnailFile && response?.data?.data?._id) {
          await uploadAlbumThumbnail({
            albumId: response?.data?.data?._id,
            file: thumbnailFile,
          });
        }
      } catch (err) {
        console.error('Update album failed:', err);
      }
    },
    [
      title,
      artist,
      description,
      year,
      genre,
      album._id,
      thumbnailFile,
      updateAlbum,
      uploadAlbumThumbnail,
    ]
  );

  return {
    isSubmitting: isUpdatingAlbum || isUploadingAlbumThumbnail,
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
    handleSubmit,
  };
};
