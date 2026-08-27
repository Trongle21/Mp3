import api from "./api";
import type { ApiSuccess, PaginatedResponse } from "@/types/api-response";
import type { Album, AlbumListItem, AlbumQueryParams } from "@/interfaces/album.interface";

export const createAlbum = (body: {
  title: string;
  artist?: string;
  description?: string;
  year?: number | null;
  genre?: string;
}) => api.post<ApiSuccess<Album>>("/albums", body);

export const listAlbums = (params?: AlbumQueryParams) =>
  api.get<PaginatedResponse<AlbumListItem>>("/albums", { params });

export const getAlbum = (id: string) => api.get<ApiSuccess<Album>>(`/albums/${id}`);

export const updateAlbum = (
  id: string,
  body: {
    title?: string;
    artist?: string;
    description?: string;
    year?: number | null;
    genre?: string;
  }
) => api.patch<ApiSuccess<Album>>(`/albums/${id}`, body);

export const deleteAlbum = (id: string) =>
  api.delete<ApiSuccess<{ id: string }>>(`/albums/${id}`);

export const uploadAlbumThumbnail = (id: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post<ApiSuccess<Album>>(`/albums/${id}/thumbnail`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteAlbumThumbnail = (id: string) =>
  api.delete<ApiSuccess<Album>>(`/albums/${id}/thumbnail`);

export const addTrackToAlbum = (albumId: string, trackId: string) =>
  api.post<ApiSuccess<{ message?: string }>>(`/albums/${albumId}/tracks`, { trackId });

export const removeTrackFromAlbum = (albumId: string, trackId: string) =>
  api.delete<ApiSuccess<null>>(`/albums/${albumId}/tracks/${trackId}`);

export const reorderAlbumTracks = (albumId: string, trackIds: string[]) =>
  api.patch<ApiSuccess<null>>(`/albums/${albumId}/reorder`, { trackIds });

export const getAlbumThumbnailUrl = (id: string) =>
  `${process.env.NEXT_PUBLIC_API_URL}/albums/${id}/thumbnail`;
