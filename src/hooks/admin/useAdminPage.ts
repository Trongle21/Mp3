import type { IUpdateRoleBody, IUpdateUserBody, IUser } from '@/interfaces';
import { useQueryClient } from '@tanstack/react-query';

import { USER_QUERY_KEYS } from '@/constants';
import {
  useDeleteUserMutation,
  useGetAllUserQuery,
  useUpdateRoleMutation,
  useUpdateUserMutation,
} from '@/services';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '../useAuth';

const ADMIN_ROLE_LABELS: Record<string, string> = {
  master: 'Master',
  normal: 'Admin',
};

export const useAdminPage = () => {
  const queryClient = useQueryClient();

  const router = useRouter();

  const { user: currentUser } = useAuth();

  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<IUser | null>(null);

  const { data, isLoading, isError } = useGetAllUserQuery({});

  const { mutateAsync: updateRole, isPending: isUpdatingRole } =
    useUpdateRoleMutation({
      configs: {
        onSuccess: data => {
          queryClient.invalidateQueries({
            queryKey: [USER_QUERY_KEYS.GET_ALL_USERS],
          });

          const label =
            ADMIN_ROLE_LABELS[data?.data?.data?.isAdmin ?? ''] ?? 'User';

          toast.success(`Update role successfully to ${label}`);
        },
        onError: (err: unknown) => {
          const axiosErr = err as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            axiosErr?.response?.data?.message || 'Update role failed'
          );
        },
      },
    });

  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUserMutation({
      configs: {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [USER_QUERY_KEYS.GET_ALL_USERS],
          });

          toast.success('Update user information successfully');
        },

        onError: (err: unknown) => {
          const axiosErr = err as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            axiosErr?.response?.data?.message ||
              'Update user information failed'
          );
        },
      },
    });

  const { mutateAsync: deleteUser, isPending: isDeletingUser } =
    useDeleteUserMutation({
      configs: {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [USER_QUERY_KEYS.GET_ALL_USERS],
          });

          toast.success(`Deleted user successfully`);
        },

        onError: (err: unknown) => {
          const axiosErr = err as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            axiosErr?.response?.data?.message || 'Delete user failed'
          );
        },
      },
    });

  const handleUpdateRole = useCallback(
    (userId: string, role: 'master' | 'normal') => {
      const body: IUpdateRoleBody = {
        isAdmin: role,
      };

      updateRole({ userId, body });
    },
    [updateRole]
  );
  const handleUpdateUser = useCallback(
    (userId: string, body: IUpdateUserBody) => {
      updateUser({ userId, body });
    },
    [updateUser]
  );

  const handleDeleteUser = useCallback(
    (userId: string) => {
      deleteUser({ userId });
    },
    [deleteUser]
  );

  useEffect(() => {
    if (currentUser && currentUser.isAdmin !== 'master') {
      router.replace('/');
    }
  }, [currentUser, router]);

  return {
    currentUser,
    users: data,
    isLoading,
    isError,
    handleUpdateRole,
    handleUpdateUser,
    handleDeleteUser,
    isUpdatingRole,
    isUpdatingUser,
    isDeletingUser,
    editingUser,
    deletingUser,
    setEditingUser,
    setDeletingUser,
  };
};
