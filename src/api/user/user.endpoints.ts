export const USER_ENDPOINTS = {
  BASE: '/users',
  DETAIL: (userId: string) => `/users/${userId}`,
  ROLE: (userId: string) => `/users/${userId}/role`,
  ME: '/users/me',
  AVATAR: '/users/me/avatar',
};
