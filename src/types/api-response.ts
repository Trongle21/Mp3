import type { UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

export interface IApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiValidationError {
  success: false;
  errors: ApiFieldError[];
  message?: string;
}

export interface ApiGenericError {
  success: false;
  message: string;
}

export type IApiError = AxiosError<ApiGenericError | ApiValidationError>;

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IPaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: Pagination;
}

/** Type guard: narrows an ApiError to the validation-error shape. */
export function isValidationError(
  error: IApiError
): error is AxiosError<ApiValidationError> {
  return 'errors' in error;
}

export type IAppMutationOptions<
  TVariables,
  TResponse,
  TError = Error,
  TContext = unknown,
> = UseMutationOptions<TResponse, TError, TVariables, TContext>;
