import api from "./api";
import type { ApiSuccess } from "@/types/api-response";
import type { Group } from "@/interfaces/group.interface";

export const createGroup = (name: string) =>
  api.post<ApiSuccess<Group>>("/groups", { name });

export const listGroups = () => api.get<ApiSuccess<Group[]>>("/groups");

export const getGroup = (id: string) => api.get<ApiSuccess<Group>>(`/groups/${id}`);

export const updateGroup = (id: string, name: string) =>
  api.patch<ApiSuccess<Group>>(`/groups/${id}`, { name });

export const deleteGroup = (id: string) => api.delete<ApiSuccess<{ id: string }>>(`/groups/${id}`);

export const uploadGroupThumbnail = (id: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post<ApiSuccess<Group>>(`/groups/${id}/thumbnail`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteGroupThumbnail = (id: string) =>
  api.delete<ApiSuccess<Group>>(`/groups/${id}/thumbnail`);

export const addTrackToGroup = (groupId: string, trackId: string) =>
  api.post<ApiSuccess<{ position: number; message?: string }>>(`/groups/${groupId}/tracks`, {
    trackId,
  });

export const removeTrackFromGroup = (groupId: string, trackId: string) =>
  api.delete<ApiSuccess<null>>(`/groups/${groupId}/tracks/${trackId}`);

export const reorderGroupTracks = (groupId: string, orderedIds: string[]) =>
  api.patch<ApiSuccess<null>>(`/groups/${groupId}/reorder`, { orderedIds });
