import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as groupsApi from "@/lib/api-groups";

export function useGroups() {
  return useQuery({
    queryKey: ["groups"],
    queryFn: async () => (await groupsApi.listGroups()).data.data,
  });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: ["group", id],
    queryFn: async () => (await groupsApi.getGroup(id)).data.data,
    enabled: !!id,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => groupsApi.createGroup(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });
}

export function useDeleteGroupInline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => groupsApi.deleteGroup(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });
}

export function useRenameGroup(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => groupsApi.updateGroup(groupId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
    },
  });
}

export function useRemoveTrackFromGroup(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (trackId: string) => groupsApi.removeTrackFromGroup(groupId, trackId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["group", groupId] }),
  });
}

export function useAddTrackToGroup(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (trackId: string) => groupsApi.addTrackToGroup(groupId, trackId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["group", groupId] }),
  });
}

export function useReorderGroupTracks(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => groupsApi.reorderGroupTracks(groupId, orderedIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["group", groupId] }),
  });
}
