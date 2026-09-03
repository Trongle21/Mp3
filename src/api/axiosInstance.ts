import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

const axiosClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  });

  instance.interceptors.request.use(config => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  let isRefreshing = false;
  let pendingQueue: Array<(token: string | null) => void> = [];

  function flushQueue(token: string | null) {
    pendingQueue.forEach(resolve => resolve(token));
    pendingQueue = [];
  }

  instance.interceptors.response.use(
    res => res,
    async (error: AxiosError) => {
      const originalRequest = error.config as
        (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest._retry
      ) {
        return Promise.reject(error);
      }

      if (typeof window === 'undefined') {
        return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        // Wait for the in-flight refresh to finish, then retry with its token.
        return new Promise((resolve, reject) => {
          pendingQueue.push(token => {
            if (!token) {
              return reject(error);
            }
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(instance(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const { data } = await axios.post(`${apiUrl}/auth/refresh`, {
          refreshToken,
        });

        const newToken: string = data.data.accessToken;
        localStorage.setItem('accessToken', newToken);

        flushQueue(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return instance(originalRequest);
      } catch (refreshError) {
        flushQueue(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );

  return instance;
};

export const ApiClient = axiosClient();
