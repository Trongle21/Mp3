import { useCallback, useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { USER_QUERY_KEYS } from '@/constants';
import type { IUpdateMeBody } from '@/interfaces';
import {
  useDeleteAvatarMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useUploadAvatarMutation,
} from '@/services';
import { useAuthStore } from '@/stores/auth.store';

export const useProfilePage = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore(s => s.setUser);

  const { data, isLoading } = useGetMeQuery();

  const user = data?.data;

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  const { mutate: updateProfileMutation, isPending: isUpdating } =
    useUpdateMeMutation({
      configs: {
        onSuccess: res => {
          const updated = res.data?.data;
          queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEYS.GET_ME] });
          setUser(updated);
          toast.success('Profile saved');
        },
        onError: () => toast.error("Couldn't save profile"),
      },
    });

  const { mutate: uploadAvatarMutation, isPending: isUploading } =
    useUploadAvatarMutation({
      configs: {
        onSuccess: () => toast.success('Avatar updated'),
        onError: () => toast.error("Couldn't upload avatar"),
      },
    });

  const { mutate: deleteAvatarMutation } = useDeleteAvatarMutation({
    configs: {
      onSuccess: () => toast.success('Avatar removed'),
      onError: () => toast.error("Couldn't delete avatar"),
    },
  });

  const handleUpdateProfile = useCallback((body: IUpdateMeBody) => {
    updateProfileMutation({ body });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUploadAvatar = useCallback((file: File) => {
    uploadAvatarMutation({ file });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteAvatar = useCallback(() => {
    deleteAvatarMutation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    user,
    isLoading,
    handleUpdateProfile,
    isUpdating,
    handleUploadAvatar,
    isUploading,
    handleDeleteAvatar,
  };
};
