import type { IPaginatedResponse } from '@/types/api-response';
import type {
  ITrack,
  ITrackResponse,
  TrackQueryParams,
} from '@/interfaces/track.interface';

import { TRACK_ENDPOINTS } from './track.endpoints';
import { AxiosService } from '../axiosService';

export const trackApi = {
  upload: (formData: FormData, onUploadProgress?: (percent: number) => void) =>
    AxiosService.post<ITrackResponse>(TRACK_ENDPOINTS.UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: evt => {
        if (!onUploadProgress || !evt.total) {
          return;
        }
        onUploadProgress(Math.round((evt.loaded / evt.total) * 100));
      },
    }),

  list: (params?: TrackQueryParams) =>
    AxiosService.get<IPaginatedResponse<ITrack>>(TRACK_ENDPOINTS.BASE, {
      params,
    }),

  getById: (id: string) =>
    AxiosService.get<ITrackResponse>(TRACK_ENDPOINTS.DETAIL(id)),

  update: (
    id: string,
    body: Partial<Pick<ITrack, 'title' | 'artist' | 'album'>>
  ) => AxiosService.patch<ITrackResponse>(TRACK_ENDPOINTS.DETAIL(id), body),

  delete: (id: string) =>
    AxiosService.delete<{ id: string }>(TRACK_ENDPOINTS.DETAIL(id)),

  uploadCover: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return AxiosService.post<ITrackResponse>(
      TRACK_ENDPOINTS.COVER(id),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
  },

  deleteCover: (id: string) =>
    AxiosService.delete<ITrackResponse>(TRACK_ENDPOINTS.COVER(id)),

  getStreamUrl: (id: string) =>
    AxiosService.get<string>(TRACK_ENDPOINTS.STREAM(id)),

  fetchStream: async (id: string): Promise<Blob> => {
    const res = await AxiosService.get<Blob>(TRACK_ENDPOINTS.STREAM(id), {
      responseType: 'blob',
    });
    return res.data;
  },
};
