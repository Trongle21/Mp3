import api from "./api";
import type { ApiSuccess, PaginatedResponse } from "@/types/api-response";
import type { Track, TrackQueryParams } from "@/interfaces/track.interface";

export const uploadTrack = (
  formData: FormData,
  onUploadProgress?: (percent: number) => void
) =>
  api.post<ApiSuccess<Track>>("/tracks/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (!onUploadProgress || !evt.total) return;
      onUploadProgress(Math.round((evt.loaded / evt.total) * 100));
    },
  });

export const listTracks = (params?: TrackQueryParams) =>
  api.get<PaginatedResponse<Track>>("/tracks", { params });

export const getTrack = (id: string) => api.get<ApiSuccess<Track>>(`/tracks/${id}`);

export const updateTrack = (id: string, body: Partial<Pick<Track, "title" | "artist" | "album">>) =>
  api.patch<ApiSuccess<Track>>(`/tracks/${id}`, body);

export const deleteTrack = (id: string) =>
  api.delete<ApiSuccess<{ id: string }>>(`/tracks/${id}`);

export const uploadTrackCover = (id: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post<ApiSuccess<Track>>(`/tracks/${id}/cover`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteTrackCover = (id: string) =>
  api.delete<ApiSuccess<Track>>(`/tracks/${id}/cover`);

export const streamTrackUrl = (id: string) =>
  `${process.env.NEXT_PUBLIC_API_URL}/tracks/${id}/stream`;

/**
 * Downloads the audio blob for a track. The Authorization header is added by the
 * axios interceptor (including the 401 -> refresh -> retry flow). Returns a Blob
 * whose object URL can be assigned to an <audio> element's `src`.
 */
export const fetchTrackStream = async (id: string): Promise<Blob> => {
  const res = await api.get<Blob>(`/tracks/${id}/stream`, {
    responseType: "blob",
  });
  return res.data;
};
