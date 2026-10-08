import { createTransport } from "nodemailer";
import { getEnv, isProduction } from "@/lib/env";

// Outgoing mail over SMTP with Nodemailer, so any provider works (Postmark,
// SES, Mailgun, Brevo, Gmail/Workspace, a self-hosted server…).
// Without SMTP_HOST, messages are logged instead of sent: in full during
// development (so invite/reset links are usable locally), and as recipient +
// subject only in production (never leak links into logs).

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  /** Category for the provider's dashboards, sent as X-Tag (and X-PM-Tag for Postmark). */
  tag?: string;
  headers?: Record<string, string>;
}

type Transport = ReturnType<typeof createTransport>;
let transport: Transport | null = null;

/** One transport per server instance (connections are opened per send). */
function getTransport(): Transport | null {
  const env = getEnv();
  if (!env.SMTP_HOST) return null;
  const secure = env.SMTP_SECURE ? env.SMTP_SECURE === "true" : env.SMTP_PORT === 465;
  const auth = env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined;
  transport ??= createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure,
    // Never send credentials in clear text: with auth, STARTTLS is mandatory.
    // (Unauthenticated local catchers such as Mailpit on :1025 still work.)
    requireTLS: !secure && Boolean(auth),
    auth,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transport;
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  const env = getEnv();
  const smtp = getTransport();
  if (!smtp || !env.EMAIL_FROM) {
    if (isProduction()) {
      console.warn(`[email] SMTP_HOST not set; not sent: "${message.subject}" → ${message.to}`);
    } else {
      console.info(`[email:dev] To: ${message.to}\nSubject: ${message.subject}\n\n${message.text}\n`);
    }
    return;
  }

  await smtp.sendMail({
    from: env.EMAIL_FROM,
    to: message.to,
    replyTo: message.replyTo,
    subject: message.subject,
    html: message.html,
    text: message.text,
    headers: {
      ...message.headers,
      ...(message.tag ? { "X-Tag": message.tag, "X-PM-Tag": message.tag } : {}),
    },
  });
}

/** Verifies the SMTP connection and credentials (used by scripts/diagnostics). */
export async function verifySmtp(): Promise<boolean> {
  const smtp = getTransport();
  if (!smtp) return false;
  await smtp.verify();
  return true;
}
