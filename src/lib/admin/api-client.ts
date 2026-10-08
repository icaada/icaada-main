// Browser-side client for /api/** (used by the admin screens). Mirrors the
// server's response contract: `{ data, meta? }` on success and
// `{ error: { code, message, details? } }` on failure.

export class AdminApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

export interface ApiResult<T, M = Record<string, unknown>> {
  data: T;
  meta?: M;
}

async function request<T, M>(method: string, path: string, body?: unknown): Promise<ApiResult<T, M>> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    });
  } catch {
    throw new AdminApiError(0, 'NETWORK_ERROR', 'Could not reach the server. Check your connection and try again.');
  }

  if (response.status === 204) return { data: undefined as T };
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const error = json?.error;
    // Session expired or account disabled: send the user back to sign in.
    if (response.status === 401 && typeof window !== 'undefined' && !path.startsWith('/auth/')) {
      // Full reload on purpose: it drops all client state for the old session.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign('/admin/login');
    }
    throw new AdminApiError(
      response.status,
      error?.code ?? 'UNKNOWN',
      error?.message ?? 'Something went wrong. Please try again.',
      error?.details && typeof error.details === 'object' ? error.details : undefined,
    );
  }
  return { data: json?.data as T, meta: json?.meta as M };
}

export const adminApi = {
  get: <T, M = Record<string, unknown>>(path: string) => request<T, M>('GET', path),
  post: <T, M = Record<string, unknown>>(path: string, body?: unknown) => request<T, M>('POST', path, body ?? {}),
  patch: <T, M = Record<string, unknown>>(path: string, body: unknown) => request<T, M>('PATCH', path, body),
  del: (path: string) => request<undefined, never>('DELETE', path),
};

/** One readable sentence for a toast, including publish-rule problems from the server. */
export function errorMessage(error: unknown): string {
  if (error instanceof AdminApiError) {
    const reasons = error.details?.status ?? error.details?._root;
    return reasons?.length ? `${error.message} ${reasons.join(' ')}` : error.message;
  }
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export function withQuery(path: string, params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') query.set(key, String(value));
  }
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}
