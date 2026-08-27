import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUsers, updateUserRole, updateUser, deleteUser } from "@/lib/api-users";
import type { User } from "@/interfaces/user.interface";
import { toast } from "sonner";

export function useUsers() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data: res } = await getAllUsers();
      return res.data;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, isAdmin }: { userId: string; isAdmin: "normal" | null }) =>
      updateUserRole(userId, { isAdmin }),
    onSuccess: (res) => {
      queryClient.setQueryData(["admin", "users"], (old: User[] | undefined) =>
        old?.map((u) => (u._id === res.data.data._id ? res.data.data : u))
      );
      const label = res.data.data.isAdmin === "master" ? "Master" : res.data.data.isAdmin === "normal" ? "Admin" : "User";
      toast.success(`Đã cập nhật vai trò thành ${label}`);
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || "Không thể cập nhật vai trò");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (payload: { userId: string; name?: string; birthdate?: string | null; gender?: "male" | "female" | "other" | null }) =>
      updateUser(payload.userId, { name: payload.name, birthdate: payload.birthdate, gender: payload.gender }),
    onSuccess: (res) => {
      queryClient.setQueryData(["admin", "users"], (old: User[] | undefined) =>
        old?.map((u) => (u._id === res.data.data._id ? res.data.data : u))
      );
      toast.success("Đã lưu thay đổi");
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || "Không thể cập nhật thông tin");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: (_res, userId) => {
      queryClient.setQueryData(["admin", "users"], (old: User[] | undefined) =>
        old?.filter((u) => u._id !== userId)
      );
      const deletedUser = queryClient.getQueryData<User[]>(["admin", "users"])?.find((u) => u._id === userId);
      toast.success(`Đã xóa user "${deletedUser?.name || deletedUser?.email || userId}"`);
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || "Không thể xóa user");
    },
  });

  return {
    users: data,
    isLoading,
    error,
    updateRole: updateRoleMutation.mutateAsync,
    updateUser: updateUserMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,
    isUpdatingRole: updateRoleMutation.isPending,
    isUpdatingUser: updateUserMutation.isPending,
    isDeletingUser: deleteUserMutation.isPending,
  };
}
