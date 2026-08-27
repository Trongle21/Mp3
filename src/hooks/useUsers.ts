import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUsers, updateUserRole } from "@/lib/api-users";
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
    mutationFn: ({ userId, isAdmin }: { userId: string; isAdmin: "normal" | "master" | null }) =>
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

  return {
    users: data,
    isLoading,
    error,
    updateRole: updateRoleMutation.mutateAsync,
    isUpdating: updateRoleMutation.isPending,
  };
}
