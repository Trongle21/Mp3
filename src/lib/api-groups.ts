import type { ApiSuccess } from "@/types/api-response";
import type { Group } from "@/interfaces/group.interface";
import { ApiClient } from "@/api";

export const createGroup = (name: string) =>
  ApiClient.post<ApiSuccess<Group>>("/groups", { name });

export const listGroups = () => ApiClient.get<ApiSuccess<Group[]>>("/groups");

export const getGroup = (id: string) =>
  ApiClient.get<ApiSuccess<Group>>(`/groups/${id}`);

export const updateGroup = (id: string, name: string) =>
  ApiClient.patch<ApiSuccess<Group>>(`/groups/${id}`, { name });

export const deleteGroup = (id: string) =>
  ApiClient.delete<ApiSuccess<{ id: string }>>(`/groups/${id}`);

export const uploadGroupThumbnail = (id: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return ApiClient.post<ApiSuccess<Group>>(
    `/groups/${id}/thumbnail`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
};

export const deleteGroupThumbnail = (id: string) =>
  ApiClient.delete<ApiSuccess<Group>>(`/groups/${id}/thumbnail`);

export const addTrackToGroup = (groupId: string, trackId: string) =>
  ApiClient.post<ApiSuccess<{ position: number; message?: string }>>(
    `/groups/${groupId}/tracks`,
    {
      trackId,
    },
  );

export const removeTrackFromGroup = (groupId: string, trackId: string) =>
  ApiClient.delete<ApiSuccess<null>>(`/groups/${groupId}/tracks/${trackId}`);

export const reorderGroupTracks = (groupId: string, orderedIds: string[]) =>
  ApiClient.patch<ApiSuccess<null>>(`/groups/${groupId}/reorder`, {
    orderedIds,
  });
