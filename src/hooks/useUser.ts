import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, updateMe, uploadAvatar, deleteAvatar } from "@/lib/api-user";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";

export function useUser() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const { data: res } = await getMe();
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: ({ data: res }) => {
      const updated = res.data;
      queryClient.setQueryData(["user", "me"], updated);
      setUser(updated);
      toast.success("Profile saved");
    },
    onError: () => toast.error("Couldn't save profile"),
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => refetch(),
    onError: () => toast.error("Couldn't upload avatar"),
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: deleteAvatar,
    onSuccess: () => refetch(),
    onError: () => toast.error("Couldn't delete avatar"),
  });

  return {
    user: data,
    isLoading,
    error,
    updateProfile: async (fields: Parameters<typeof updateMe>[0]) => {
      await updateMutation.mutateAsync(fields);
    },
    isUpdating: updateMutation.isPending,
    uploadAvatar: async (file: File) => {
      await uploadAvatarMutation.mutateAsync(file);
    },
    deleteAvatar: async () => {
      await deleteAvatarMutation.mutateAsync();
    },
  };
}
