/**
 * Frontend counterpart to the backend Error Catalog.
 *
 * The backend returns a standard envelope on every error:
 *   { status, errorCode, message, traceId, timestamp }
 *
 * `getApiError(err)` normalizes ANY thrown value (axios error, network
 * failure, or plain Error) into a consistent shape the UI can rely on:
 *   { code, message, status, traceId }
 *
 * `message` is always safe to show directly (the backend sends user-facing
 * messages; we only fall back to a generic string when none is available).
 */

export interface NormalizedApiError {
  /** Machine-readable error code from the backend, or a synthetic one. */
  code: string;
  /** User-facing message, safe to display. */
  message: string;
  /** HTTP status if available (0 for network/unknown errors). */
  status: number;
  /** Correlation id for support/log lookup, if the backend provided one. */
  traceId?: string;
}

const GENERIC_MESSAGE = 'Something went wrong. Please try again.';
const NETWORK_MESSAGE = 'Unable to reach the server. Please check your connection and try again.';

/**
 * Normalize any caught error into a NormalizedApiError.
 * Prefers the backend envelope (err.response.data), then axios/Error message,
 * then generic fallbacks — never surfaces raw stack traces.
 */
export function getApiError(err: unknown): NormalizedApiError {
  const anyErr = err as any;

  // Axios error with a server response (the standard envelope)
  const data = anyErr?.response?.data;
  if (data && typeof data === 'object') {
    return {
      code: data.errorCode || 'INTERNAL_ERROR',
      message: data.message || GENERIC_MESSAGE,
      status: typeof data.status === 'number' ? data.status : (anyErr?.response?.status ?? 0),
      traceId: data.traceId,
    };
  }

  // Axios error without a parseable body (e.g. network error / timeout)
  if (anyErr?.isAxiosError) {
    const status = anyErr?.response?.status ?? 0;
    return {
      code: status === 0 ? 'NETWORK_ERROR' : 'INTERNAL_ERROR',
      message: status === 0 ? NETWORK_MESSAGE : GENERIC_MESSAGE,
      status,
    };
  }

  // Plain Error or unknown throwable
  return {
    code: 'INTERNAL_ERROR',
    message: GENERIC_MESSAGE,
    status: 0,
  };
}

/** Convenience: just the user-facing message. */
export function getApiErrorMessage(err: unknown, fallback = GENERIC_MESSAGE): string {
  const normalized = getApiError(err);
  return normalized.message || fallback;
}
