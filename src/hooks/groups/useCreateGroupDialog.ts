import type { ICreateGroupDialogProps } from '@/components';
import { GROUP_QUERY_KEYS } from '@/constants';
import type { IGroupBody } from '@/interfaces';
import {
  useCreateGroupMutation,
  useUploadGroupThumbnailMutation,
} from '@/services';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

export const useCreateGroupDialog = (props: ICreateGroupDialogProps) => {
  const { open, onOpenChange } = props;

  const [name, setName] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const {
    data,
    mutateAsync: createGroup,
    isPending: isCreatingGroup,
  } = useCreateGroupMutation({
    configs: {
      onSuccess: () => {
        toast.success('Group created');

        onOpenChange(false);
      },
      onError: () => {
        toast.error("Couldn't create group");
      },
    },
  });

  const { mutate: uploadThumbnail, isPending: isUploadingThumbnail } =
    useUploadGroupThumbnailMutation({
      configs: {
        onSuccess: () => {
          toast.success('Thumbnail uploaded');

          queryClient.invalidateQueries({
            queryKey: [GROUP_QUERY_KEYS.GET_GROUPS],
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
      const trimmed = name.trim();
      if (!trimmed) {
        return;
      }

      const body: IGroupBody = { name: trimmed };

      try {
        const response = await createGroup({ body });

        const newGroupId = response?.data?.data?._id;

        if (thumbnailFile && newGroupId) {
          await uploadThumbnail({
            groupId: newGroupId,
            file: thumbnailFile,
          });
        }
      } catch (err) {
        console.error('Create group failed:', err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, thumbnailFile, data]
  );

  useEffect(() => {
    if (!open) {
      setName('');
      setThumbnailFile(null);
    }
  }, [open]);

  return {
    handleSubmit,
    isSubmitting: isCreatingGroup || isUploadingThumbnail,
    name,
    setName,
    thumbnailFile,
    setThumbnailFile,
  };
};
