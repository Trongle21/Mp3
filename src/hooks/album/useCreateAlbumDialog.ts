import type { ICreateAlbumDialogProps } from '@/components';
import { ALBUM_QUERY_KEYS } from '@/constants';
import type { IAlbumBody } from '@/interfaces';
import {
  useCreateAlbumMutation,
  useUploadAlbumThumbnailMutation,
} from '@/services';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

export const useCreateAlbumDialog = (props: ICreateAlbumDialogProps) => {
  const { open, onOpenChange } = props;

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState('');
  const [genre, setGenre] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const {
    data,
    mutateAsync: createAlbum,
    isPending: isCreatingAlbum,
  } = useCreateAlbumMutation({
    configs: {
      onSuccess: () => {
        toast.success('Album created');

        onOpenChange(false);
      },

      onError: () => {
        toast.error("Couldn't create album");
      },
    },
  });

  const { mutate: uploadThumbnail, isPending: isUploadingThumbnail } =
    useUploadAlbumThumbnailMutation({
      configs: {
        onSuccess: () => {
          toast.success('Thumbnail uploaded');

          queryClient.invalidateQueries({
            queryKey: [ALBUM_QUERY_KEYS.GET_ALBUMS],
          });
        },
        onError: () => {
          toast.error("Couldn't upload thumbnail");
        },
      },
    });

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
        const response = await createAlbum({ body });

        const newAlbumId = response?.data?.data?._id;

        if (thumbnailFile && newAlbumId) {
          await uploadThumbnail({
            albumId: newAlbumId,
            file: thumbnailFile,
          });
        }
      } catch (err) {
        console.error('Create album failed:', err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [title, artist, description, year, genre, thumbnailFile, data]
  );

  useEffect(() => {
    if (!open) {
      setTitle('');
      setArtist('');
      setDescription('');
      setYear('');
      setGenre('');
      setThumbnailFile(null);
    }
  }, [open]);

  return {
    handleSubmit,
    isSubmitting: isCreatingAlbum || isUploadingThumbnail,
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
  };
};
