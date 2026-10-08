// Outbound notifications (email, Slack, …). Email delivery is out of scope for
// now, so the default implementation only logs. Swap `notifier` for a real
// transport later without touching the services that call it.

export type NotificationEvent =
  | { type: "contact.received"; id: string; name: string; email: string; subject: string }
  | { type: "volunteer.received"; id: string; name: string; email: string; state: string }
  | { type: "newsletter.subscribed"; email: string };

export interface Notifier {
  notify(event: NotificationEvent): Promise<void>;
}

export const consoleNotifier: Notifier = {
  async notify(event) {
    console.info(`[notifier] ${event.type}`, event);
  },
};

export const notifier: Notifier = consoleNotifier;
