import type { IUploadFormProps } from '@/components';
import { TRACK_QUERY_KEYS } from '@/constants';
import {
  useGetAlbumListQuery,
  useUploadTrackCoverMutation,
  useUploadTrackMutation,
} from '@/services';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

export const useUpLoadForm = (props: IUploadFormProps) => {
  const { onDone } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [meta, setMeta] = useState({ title: '', artist: '', albumId: '' });

  const { data: albumsData } = useGetAlbumListQuery({ limit: 100 });

  const { mutateAsync: uploadTrack, isPending: isUploading } =
    useUploadTrackMutation({
      configs: {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [TRACK_QUERY_KEYS.GET_TRACKS],
          });
        },
      },
    });

  const { mutateAsync: uploadTrackCover } = useUploadTrackCoverMutation({
    configs: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [TRACK_QUERY_KEYS.GET_TRACKS],
        });
      },
    },
  });

  const handleFile = (f: File) => {
    if (!f.type.startsWith('audio/')) {
      toast.error('Please choose an audio file');
      return;
    }
    setFile(f);
    setMeta(m => ({
      ...m,
      title: m.title || f.name.replace(/\.[^/.]+$/, ''),
    }));
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      handleFile(dropped);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) {
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (meta.title) {
        formData.append('title', meta.title);
      }
      if (meta.artist) {
        formData.append('artist', meta.artist);
      }
      if (meta.albumId) {
        formData.append('albumId', meta.albumId);
      }

      const { data: track } = await uploadTrack({
        formData,
        onUploadProgress: setProgress,
      });

      if (coverFile) {
        try {
          await uploadTrackCover({ trackId: track._id, file: coverFile });
        } catch (err) {
          console.warn('Cover upload failed:', err);
          toast.warning(
            "Track uploaded, but the cover image couldn't be saved."
          );
        }
      }

      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      if (meta.albumId) {
        queryClient.invalidateQueries({
          queryKey: ['album', meta.albumId],
        });
      }
      toast.success('Track uploaded');
      onDone();
    } catch {
      toast.error('Upload failed. Try again.');
    }
  };

  return {
    file,
    setFile,
    isDragging,
    setIsDragging,
    onDrop,
    inputRef,
    handleFile,
    meta,
    setMeta,
    coverFile,
    setCoverFile,
    isUploading,
    progress,
    handleUpload,
    albumsData,
  };
};
