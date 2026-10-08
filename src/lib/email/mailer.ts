import { getEnv, isProduction } from "@/lib/env";

// Transactional email through Postmark's HTTP API (no SDK needed).
// Without POSTMARK_SERVER_TOKEN, messages are logged instead of sent: in full
// during development (so invite/reset links are usable locally), and as
// recipient + subject only in production (never leak links into logs).

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  /** Postmark tag for filtering in the activity view, e.g. "password-reset". */
  tag?: string;
  headers?: Record<string, string>;
}

const POSTMARK_URL = "https://api.postmarkapp.com/email";

export async function sendEmail(message: EmailMessage): Promise<void> {
  const env = getEnv();
  if (!env.POSTMARK_SERVER_TOKEN || !env.EMAIL_FROM) {
    if (isProduction()) {
      console.warn(`[email] POSTMARK_SERVER_TOKEN not set; not sent: "${message.subject}" → ${message.to}`);
    } else {
      console.info(`[email:dev] To: ${message.to}\nSubject: ${message.subject}\n\n${message.text}\n`);
    }
    return;
  }

  const response = await fetch(POSTMARK_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": env.POSTMARK_SERVER_TOKEN,
    },
    body: JSON.stringify({
      From: env.EMAIL_FROM,
      To: message.to,
      Subject: message.subject,
      HtmlBody: message.html,
      TextBody: message.text,
      ReplyTo: message.replyTo,
      Tag: message.tag,
      MessageStream: env.POSTMARK_MESSAGE_STREAM,
      Headers: message.headers ? Object.entries(message.headers).map(([Name, Value]) => ({ Name, Value })) : undefined,
    }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(`Postmark rejected "${message.subject}" (${response.status}${body?.ErrorCode !== undefined ? `, code ${body.ErrorCode}` : ""}): ${body?.Message ?? "unknown error"}`);
  }
}
