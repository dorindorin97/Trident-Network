// API error handling utilities

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function fetchApi(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || 'Request failed',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or parsing error
    throw new ApiError(
      'Network error or invalid response',
      0,
      { originalError: error.message }
    );
  }
}

export function getErrorMessage(error) {
  if (error instanceof ApiError) {
    if (error.status === 400) return 'Invalid request parameters';
    if (error.status === 404) return 'Resource not found';
    if (error.status === 429) return 'Too many requests. Please try again later';
    if (error.status === 503) return 'Service temporarily unavailable';
    return error.message || 'An error occurred';
  }
  return 'An unexpected error occurred';
}
