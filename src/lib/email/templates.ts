// Branded, inline-styled email templates (email clients ignore <style> blocks
// and CSS variables). Every interpolated value goes through `esc`.

const RED = "#C70025";
const INK = "#454545";
const MUTED = "#666666";
const LINE = "#DBDBDB";

const esc = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const paragraphs = (text: string) =>
  esc(text).split(/\n{2,}/).map((p) => `<p style="margin:0 0 14px;line-height:1.6">${p.replace(/\n/g, "<br>")}</p>`).join("");

function layout({ preheader, title, body, footer }: { preheader: string; title: string; body: string; footer?: string }) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#F5F5F5;font-family:Arial,Helvetica,sans-serif;color:${INK}">
<span style="display:none;max-height:0;overflow:hidden">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-top:4px solid ${RED}">
<tr><td style="padding:24px 28px 8px">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td style="background:${RED};color:#FFFFFF;font-weight:bold;font-size:13px;width:32px;height:32px;text-align:center">IC</td>
    <td style="padding-left:10px;font-weight:bold;font-size:16px;letter-spacing:-0.3px">ICAADA</td>
  </tr></table>
</td></tr>
<tr><td style="padding:16px 28px 8px"><h1 style="margin:0 0 16px;font-size:21px;line-height:1.25;color:${INK}">${esc(title)}</h1>${body}</td></tr>
<tr><td style="padding:16px 28px 24px;border-top:1px solid ${LINE};color:${MUTED};font-size:12px;line-height:1.5">
  Initiative for Community Action Against Drug Abuse${footer ? `<br>${footer}` : ""}
</td></tr>
</table></td></tr></table></body></html>`;
}

const button = (href: string, label: string) =>
  `<p style="margin:22px 0"><a href="${esc(href)}" style="background:${RED};color:#FFFFFF;text-decoration:none;font-weight:bold;padding:12px 20px;display:inline-block">${esc(label)}</a></p>`;

const detailRows = (rows: [string, string | null | undefined][]) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;font-size:14px">${rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:3px 14px 3px 0;color:${MUTED};vertical-align:top">${esc(k)}</td><td style="padding:3px 0">${esc(String(v))}</td></tr>`)
    .join("")}</table>`;

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function contactAlertEmail(m: { name: string; email: string; subject: string; body: string; adminUrl: string }): RenderedEmail {
  const subject = `New message: ${m.subject}`;
  return {
    subject,
    html: layout({
      preheader: `${m.name} sent a message through the website.`,
      title: "New message from the website",
      body: detailRows([["From", `${m.name} <${m.email}>`], ["Subject", m.subject]]) + paragraphs(m.body) +
        button(m.adminUrl, "Open in the inbox") + `<p style="font-size:13px;color:${MUTED}">Reply to this email to answer ${esc(m.name)} directly.</p>`,
    }),
    text: `New message from the website\n\nFrom: ${m.name} <${m.email}>\nSubject: ${m.subject}\n\n${m.body}\n\nOpen in the inbox: ${m.adminUrl}\nReply to this email to answer ${m.name} directly.`,
  };
}

export function volunteerAlertEmail(v: {
  name: string; email: string; phone: string | null; state: string; lga: string | null;
  interests: string[]; availability: string | null; message: string | null; adminUrl: string;
}): RenderedEmail {
  const location = [v.lga, v.state].filter(Boolean).join(", ");
  return {
    subject: `New volunteer: ${v.name} (${v.state})`,
    html: layout({
      preheader: `${v.name} from ${location} wants to volunteer.`,
      title: "New volunteer application",
      body: detailRows([["Name", v.name], ["Email", v.email], ["Phone", v.phone], ["Location", location], ["Interests", v.interests.join(", ")], ["Availability", v.availability]]) +
        (v.message ? paragraphs(v.message) : "") + button(v.adminUrl, "Review applications"),
    }),
    text: `New volunteer application\n\nName: ${v.name}\nEmail: ${v.email}\nPhone: ${v.phone ?? "-"}\nLocation: ${location}\nInterests: ${v.interests.join(", ")}\nAvailability: ${v.availability ?? "-"}\n\n${v.message ?? ""}\n\nReview applications: ${v.adminUrl}`,
  };
}

export function passwordLinkEmail(p: { name: string; link: string; purpose: "RESET" | "INVITE"; expiresIn: string; inviterName?: string }): RenderedEmail {
  const invite = p.purpose === "INVITE";
  const title = invite ? "You've been invited to the ICAADA workspace" : "Reset your ICAADA password";
  const intro = invite
    ? `${p.inviterName ?? "An administrator"} has created an ICAADA admin account for you. Choose a password to get started.`
    : "We received a request to reset the password for your ICAADA admin account.";
  const outro = invite
    ? `This link expires in ${p.expiresIn}. If you weren't expecting this, you can ignore this email.`
    : `This link expires in ${p.expiresIn} and can be used once. If you didn't ask for a reset, you can ignore this email; your password won't change.`;
  return {
    subject: title,
    html: layout({
      preheader: intro,
      title,
      body: `<p style="margin:0 0 14px;line-height:1.6">Hello ${esc(p.name)},</p>` + paragraphs(intro) +
        button(p.link, invite ? "Set your password" : "Choose a new password") +
        `<p style="font-size:13px;color:${MUTED};line-height:1.5">${esc(outro)}<br>If the button doesn't work, paste this link into your browser:<br><span style="word-break:break-all">${esc(p.link)}</span></p>`,
    }),
    text: `Hello ${p.name},\n\n${intro}\n\n${invite ? "Set your password" : "Choose a new password"}: ${p.link}\n\n${outro}`,
  };
}

export function newsletterWelcomeEmail(w: { unsubscribeUrl: string; siteUrl: string }): RenderedEmail {
  const intro = "Thank you for joining the ICAADA brief: a considered note on community work, new learning and ways to take action, about once a month.";
  return {
    subject: "You're subscribed to the ICAADA brief",
    html: layout({
      preheader: intro,
      title: "You're on the list",
      body: paragraphs(intro) + button(w.siteUrl, "Visit icaada.com.ng"),
      footer: `You're receiving this because this address was subscribed on our website. <a href="${esc(w.unsubscribeUrl)}" style="color:${MUTED}">Unsubscribe</a>`,
    }),
    text: `You're on the list\n\n${intro}\n\n${w.siteUrl}\n\nUnsubscribe: ${w.unsubscribeUrl}`,
  };
}
