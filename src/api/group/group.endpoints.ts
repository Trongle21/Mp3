export const GROUP_ENDPOINTS = {
  BASE: '/groups',
  DETAIL: (id: string) => `/groups/${id}`,
  THUMBNAIL: (id: string) => `/groups/${id}/thumbnail`,
  TRACKS: (groupId: string) => `/groups/${groupId}/tracks`,
  TRACK_DETAIL: (groupId: string, trackId: string) =>
    `/groups/${groupId}/tracks/${trackId}`,
  REORDER: (groupId: string) => `/groups/${groupId}/reorder`,
};
