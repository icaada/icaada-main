// Browser helper for the public forms (contact, volunteer, newsletter).
// Server contract: 202 `{ data: { message } }` on success; 422 with
// `error.details` (field → messages) on validation errors; 429 when rate-limited.

export type FormResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors: Record<string, string> };

export async function submitPublicForm(path: string, body: Record<string, unknown>): Promise<FormResult> {
  try {
    const response = await fetch(`/api/public/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await response.json().catch(() => null);
    if (response.ok) return { ok: true, message: json?.data?.message ?? 'Thank you.' };
    const details: Record<string, string[]> = json?.error?.details ?? {};
    const fieldErrors = Object.fromEntries(
      Object.entries(details).filter(([, v]) => Array.isArray(v)).map(([k, v]) => [k.split('.')[0], v.join(' ')]),
    );
    const message = response.status === 422
      ? 'Please check the highlighted fields.'
      : json?.error?.message ?? 'Something went wrong. Please try again.';
    return { ok: false, message, fieldErrors };
  } catch {
    return { ok: false, message: 'Could not reach the server. Check your connection and try again.', fieldErrors: {} };
  }
}

/** Name of the spam-trap field the API checks (see HONEYPOT_FIELD in Schemas/common.schema.ts). */
export const HONEYPOT_NAME = 'company';
