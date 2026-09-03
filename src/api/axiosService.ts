import type { IApiResponse } from '@/types';
import type { AxiosRequestConfig } from 'axios';
import { ApiClient } from './axiosInstance';

export const AxiosService = {
  post: async <TResponse = any, TRequest = any>(
    url: string,
    body?: TRequest,
    config?: AxiosRequestConfig<TRequest>
  ): Promise<IApiResponse<TResponse>> => {
    return await ApiClient.post(url, body, config);
  },

  postFormData: async <TResponse = any, TRequest = any>(
    url: string,
    body?: TRequest,
    config?: AxiosRequestConfig<TRequest>
  ): Promise<IApiResponse<TResponse>> => {
    return await ApiClient.post(url, body, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  put: async <TResponse = any, TRequest = any>(
    url: string,
    body?: TRequest,
    config?: AxiosRequestConfig<TRequest>
  ): Promise<IApiResponse<TResponse>> => {
    return await ApiClient.put(url, body, config);
  },
  patch: async <TResponse, TRequest = any>(
    url: string,
    body?: TRequest,
    config?: AxiosRequestConfig<TRequest>
  ): Promise<IApiResponse<TResponse>> => {
    return await ApiClient.patch(url, body, config);
  },
  delete: async <TResponse = any, TRequest = any>(
    url: string,
    body?: TRequest,
    config?: AxiosRequestConfig<TRequest>
  ): Promise<IApiResponse<TResponse>> => {
    return await ApiClient.delete(url, {
      ...config,
      data: body,
    });
  },
  get: async <TResponse = any, TRequest = any>(
    url: string,
    config?: AxiosRequestConfig<TRequest>
  ): Promise<IApiResponse<TResponse>> => {
    return await ApiClient.get(url, config);
  },
  request: async <TResponse = any, TRequest = any>(
    url: string,
    config?: AxiosRequestConfig<TRequest>
  ): Promise<IApiResponse<TResponse>> => {
    return await ApiClient.request({
      url,
      ...config,
    });
  },
  getBlob: async <TRequest = any>(
    url: string,
    config?: AxiosRequestConfig<TRequest>
  ): Promise<any> => {
    const response = await ApiClient.get<Blob>(url, {
      ...config,
      responseType: 'blob',
    });
    return response;
  },
};
