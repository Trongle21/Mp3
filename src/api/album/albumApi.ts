import { AxiosService } from '@/api';
import type {
  IAlbumBody,
  IAlbumListItem,
  IAlbumQueryParams,
  IAlbumResponse,
} from '@/interfaces';
import type { IPaginatedResponse } from '@/types';
import { ALBUM_ENDPOINTS } from './album.endpoints';

export const albumApi = {
  create: (body: IAlbumBody) =>
    AxiosService.post<IAlbumResponse>(ALBUM_ENDPOINTS.BASE, body),

  list: (params?: IAlbumQueryParams) =>
    AxiosService.get<IPaginatedResponse<IAlbumListItem>>(ALBUM_ENDPOINTS.BASE, {
      params,
    }),

  getById: (id: string) =>
    AxiosService.get<IAlbumResponse>(ALBUM_ENDPOINTS.DETAIL(id)),

  update: (id: string, body: IAlbumBody) =>
    AxiosService.patch<IAlbumResponse>(ALBUM_ENDPOINTS.DETAIL(id), body),

  delete: (id: string) =>
    AxiosService.delete<{ id: string }>(ALBUM_ENDPOINTS.DETAIL(id)),

  uploadThumbnail: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return AxiosService.post<IAlbumResponse>(
      ALBUM_ENDPOINTS.THUMBNAIL(id),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
  },

  deleteThumbnail: (id: string) =>
    AxiosService.delete<IAlbumResponse>(ALBUM_ENDPOINTS.THUMBNAIL(id)),

  addTrack: (albumId: string, trackId: string) =>
    AxiosService.post<{ message?: string }>(ALBUM_ENDPOINTS.TRACKS(albumId), {
      trackId,
    }),

  removeTrack: (albumId: string, trackId: string) =>
    AxiosService.delete<null>(ALBUM_ENDPOINTS.TRACK_DETAIL(albumId, trackId)),

  reorderTracks: (albumId: string, trackIds: string[]) =>
    AxiosService.patch<null>(ALBUM_ENDPOINTS.REORDER(albumId), { trackIds }),

  getThumbnailUrl: (id: string) =>
    AxiosService.get<string>(ALBUM_ENDPOINTS.THUMBNAIL(id)),
};
