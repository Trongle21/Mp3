import { AxiosService } from '@/api';
import type {
  IGroup,
  IGroupBody,
  IGroupQueryParams,
  IGroupResponse,
} from '@/interfaces';
import type { IPaginatedResponse } from '@/types';
import { GROUP_ENDPOINTS } from './group.endpoints';

export const groupApi = {
  create: (body: IGroupBody) =>
    AxiosService.post<IGroupResponse>(GROUP_ENDPOINTS.BASE, body),

  list: (params?: IGroupQueryParams) =>
    AxiosService.get<IPaginatedResponse<IGroup>>(GROUP_ENDPOINTS.BASE, {
      params,
    }),

  getById: (id: string) =>
    AxiosService.get<IGroupResponse>(GROUP_ENDPOINTS.DETAIL(id)),

  update: (id: string, body: IGroupBody) =>
    AxiosService.patch<IGroupResponse>(GROUP_ENDPOINTS.DETAIL(id), body),

  delete: (id: string) =>
    AxiosService.delete<{ id: string }>(GROUP_ENDPOINTS.DETAIL(id)),

  uploadThumbnail: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return AxiosService.post<IGroupResponse>(
      GROUP_ENDPOINTS.THUMBNAIL(id),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
  },

  deleteThumbnail: (id: string) =>
    AxiosService.delete<IGroupResponse>(GROUP_ENDPOINTS.THUMBNAIL(id)),

  addTrack: (groupId: string, trackId: string) =>
    AxiosService.post<{ position: number; message?: string }>(
      GROUP_ENDPOINTS.TRACKS(groupId),
      { trackId }
    ),

  removeTrack: (groupId: string, trackId: string) =>
    AxiosService.delete<null>(GROUP_ENDPOINTS.TRACK_DETAIL(groupId, trackId)),

  reorderTracks: (groupId: string, orderedIds: string[]) =>
    AxiosService.patch<null>(GROUP_ENDPOINTS.REORDER(groupId), {
      orderedIds,
    }),
};
