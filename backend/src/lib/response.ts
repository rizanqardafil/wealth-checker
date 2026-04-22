/**
 * Standard API Response Helper
 */

export type ApiResponseData<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Success response
 */
export function successResponse<T>(data: T): ApiResponseData<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Error response
 */
export function errorResponse(error: string): ApiResponseData<null> {
  return {
    success: false,
    data: null,
    error,
  };
}

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
