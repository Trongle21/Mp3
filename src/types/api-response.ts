export interface ApiSuccess<T> {
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
}

export interface ApiGenericError {
  success: false;
  message: string;
}

export type ApiError = ApiValidationError | ApiGenericError;

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: Pagination;
}

/** Type guard: narrows an ApiError to the validation-error shape. */
export function isValidationError(error: ApiError): error is ApiValidationError {
  return "errors" in error;
}
