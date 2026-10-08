import { after } from "next/server";
import { signValue } from "@/lib/auth/tokens";
import { sendEmail, type EmailMessage } from "@/lib/email/mailer";
import {
  contactAlertEmail,
  newsletterWelcomeEmail,
  passwordLinkEmail,
  volunteerAlertEmail,
} from "@/lib/email/templates";
import { appUrl } from "@/lib/env";
import { settingsService } from "@/Services/settings.service";

// Outbound email. Delivery runs after the response is sent (`after`), so a
// slow or failing mail provider never delays or fails the user's request;
// failures are logged. Outside a request (scripts), it runs inline.

export const UNSUBSCRIBE_PURPOSE = "newsletter-unsubscribe";

function deliver(label: string, build: () => Promise<EmailMessage>) {
  const run = async () => {
    try {
      await sendEmail(await build());
    } catch (error) {
      console.error(`[email] ${label} failed`, error);
    }
  };
  try {
    after(run);
  } catch {
    void run();
  }
}

/** Staff alerts go to the workspace contact email (editable in Settings). */
const staffAddress = async () => (await settingsService.get()).contactEmail;

export const notificationService = {
  contactReceived(message: { name: string; email: string; subject: string; body: string }) {
    deliver("contact alert", async () => ({
      to: await staffAddress(),
      replyTo: message.email,
      tag: "contact-alert",
      ...contactAlertEmail({ ...message, adminUrl: `${appUrl()}/admin/messages` }),
    }));
  },

  volunteerReceived(application: {
    name: string; email: string; phone: string | null; state: string; lga: string | null;
    interests: string[]; availability: string | null; message: string | null;
  }) {
    deliver("volunteer alert", async () => ({
      to: await staffAddress(),
      replyTo: application.email,
      tag: "volunteer-alert",
      ...volunteerAlertEmail({ ...application, adminUrl: `${appUrl()}/admin/volunteers` }),
    }));
  },

  subscriberWelcome(subscriber: { id: string; email: string }) {
    deliver("newsletter welcome", async () => {
      const unsubscribeUrl = this.unsubscribeUrl(subscriber.id);
      return {
        to: subscriber.email,
        tag: "newsletter-welcome",
        // One-click unsubscribe (RFC 8058), shown as a button by Gmail/Apple Mail.
        headers: { "List-Unsubscribe": `<${unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
        ...newsletterWelcomeEmail({ unsubscribeUrl, siteUrl: appUrl() }),
      };
    });
  },

  passwordLink(user: { name: string; email: string }, token: string, purpose: "RESET" | "INVITE", expiresIn: string, inviterName?: string) {
    deliver(`${purpose.toLowerCase()} email`, async () => ({
      to: user.email,
      tag: purpose === "INVITE" ? "account-invite" : "password-reset",
      ...passwordLinkEmail({
        name: user.name,
        link: `${appUrl()}/admin/reset-password?token=${encodeURIComponent(token)}`,
        purpose,
        expiresIn,
        inviterName,
      }),
    }));
  },

  /** Signed, stateless unsubscribe link for a subscriber. */
  unsubscribeUrl(subscriberId: string) {
    return `${appUrl()}/api/public/newsletter/unsubscribe?token=${encodeURIComponent(signValue(UNSUBSCRIBE_PURPOSE, subscriberId))}`;
  },
};
