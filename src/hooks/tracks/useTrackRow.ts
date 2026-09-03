import type { ITrackRowProps } from '@/components';
import type { ITrack } from '@/interfaces';
import { useDeleteTrackMutation } from '@/services';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

export const useTrackRow = (props: ITrackRowProps) => {
  const { track, onCoverUpload } = props;

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const { mutate: deleteTrack } = useDeleteTrackMutation({
    configs: {
      onSuccess: () => toast.success('Track deleted'),
      onError: () => toast.error("Couldn't delete track"),
    },
  });

  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onCoverUpload) {
      return;
    }
    setShowCoverPicker(false);
    try {
      await onCoverUpload(track, file);
    } catch {
      toast.error("Couldn't upload cover");
    }
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  };

  const handleDeleteTrack = useCallback((track: ITrack) => {
    deleteTrack({ trackId: track._id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    showEdit,
    setShowEdit,
    showDelete,
    setShowDelete,
    showCoverPicker,
    setShowCoverPicker,
    coverInputRef,
    handleCoverFile,
    deleteTrack,
    handleDeleteTrack,
  };
};
