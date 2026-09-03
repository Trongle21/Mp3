export const ALBUM_ENDPOINTS = {
  BASE: '/albums',
  DETAIL: (id: string) => `/albums/${id}`,
  THUMBNAIL: (id: string) => `/albums/${id}/thumbnail`,
  TRACKS: (albumId: string) => `/albums/${albumId}/tracks`,
  TRACK_DETAIL: (albumId: string, trackId: string) =>
    `/albums/${albumId}/tracks/${trackId}`,
  REORDER: (albumId: string) => `/albums/${albumId}/reorder`,
};
