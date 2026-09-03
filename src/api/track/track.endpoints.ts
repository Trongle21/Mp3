export const TRACK_ENDPOINTS = {
  BASE: '/tracks',
  UPLOAD: '/tracks/upload',
  DETAIL: (id: string) => `/tracks/${id}`,
  COVER: (id: string) => `/tracks/${id}/cover`,
  STREAM: (id: string) => `/tracks/${id}/stream`,
};
