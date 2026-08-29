import type { ApiSuccess, PaginatedResponse } from "@/types/api-response";
import type {
  Album,
  AlbumListItem,
  AlbumQueryParams,
} from "@/interfaces/album.interface";
import { ApiClient } from "@/api";

export const createAlbum = (body: {
  title: string;
  artist?: string;
  description?: string;
  year?: number | null;
  genre?: string;
}) => ApiClient.post<ApiSuccess<Album>>("/albums", body);

export const listAlbums = (params?: AlbumQueryParams) =>
  ApiClient.get<PaginatedResponse<AlbumListItem>>("/albums", { params });

export const getAlbum = (id: string) =>
  ApiClient.get<ApiSuccess<Album>>(`/albums/${id}`);

export const updateAlbum = (
  id: string,
  body: {
    title?: string;
    artist?: string;
    description?: string;
    year?: number | null;
    genre?: string;
  },
) => ApiClient.patch<ApiSuccess<Album>>(`/albums/${id}`, body);

export const deleteAlbum = (id: string) =>
  ApiClient.delete<ApiSuccess<{ id: string }>>(`/albums/${id}`);

export const uploadAlbumThumbnail = (id: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return ApiClient.post<ApiSuccess<Album>>(
    `/albums/${id}/thumbnail`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
};

export const deleteAlbumThumbnail = (id: string) =>
  ApiClient.delete<ApiSuccess<Album>>(`/albums/${id}/thumbnail`);

export const addTrackToAlbum = (albumId: string, trackId: string) =>
  ApiClient.post<ApiSuccess<{ message?: string }>>(
    `/albums/${albumId}/tracks`,
    {
      trackId,
    },
  );

export const removeTrackFromAlbum = (albumId: string, trackId: string) =>
  ApiClient.delete<ApiSuccess<null>>(`/albums/${albumId}/tracks/${trackId}`);

export const reorderAlbumTracks = (albumId: string, trackIds: string[]) =>
  ApiClient.patch<ApiSuccess<null>>(`/albums/${albumId}/reorder`, { trackIds });

export const getAlbumThumbnailUrl = (id: string) =>
  ApiClient.get<ApiSuccess<string>>(`/albums/${id}/thumbnail`);
