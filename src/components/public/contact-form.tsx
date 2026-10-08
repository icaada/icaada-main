"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Honeypot } from "@/components/public/honeypot";
import { HONEYPOT_NAME, submitPublicForm } from "@/lib/public-form";

const reasons = [
  { value: "community", label: "A community representative" },
  { value: "youth", label: "A young person or youth organisation" },
  { value: "institution", label: "A government or institutional partner" },
  { value: "research", label: "A researcher or practitioner" },
  { value: "development", label: "A development or private-sector partner" },
  { value: "individual", label: "An individual supporter" },
];

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; message: string } | { kind: "error"; message: string };

/** Posts to /api/public/contact; messages land in the admin inbox. */
export function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const reason = reasons.find((r) => r.value === data.get("reason"))?.label ?? "General enquiry";
    setStatus({ kind: "sending" });
    const result = await submitPublicForm("contact", {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      subject: `Reaching out as ${reason.charAt(0).toLowerCase()}${reason.slice(1)}`,
      body: String(data.get("message") ?? ""),
      [HONEYPOT_NAME]: String(data.get(HONEYPOT_NAME) ?? ""),
    });
    if (result.ok) {
      form.reset();
      setErrors({});
      setStatus({ kind: "sent", message: result.message });
    } else {
      // The API's `body` field is the message textarea.
      const { body, ...rest } = result.fieldErrors;
      setErrors(body ? { ...rest, message: body } : rest);
      setStatus({ kind: "error", message: result.message });
    }
  };

  const fieldError = (name: string) =>
    errors[name] ? <small id={`contact-${name}-error`} className="field-error" role="alert">{errors[name]}</small> : null;
  const invalid = (name: string) => ({
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `contact-${name}-error` : undefined,
  });
  const sending = status.kind === "sending";

  return (
    <form className="contact-form" onSubmit={submit} noValidate={false} data-testid="form-contact">
      <Honeypot />
      <div className="field">
        <label htmlFor="name">Your name</label>
        <input id="name" name="name" required maxLength={120} autoComplete="name" data-testid="input-contact-name" {...invalid("name")} />
        {fieldError("name")}
      </div>
      <div className="field">
        <label htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" required maxLength={254} autoComplete="email" data-testid="input-contact-email" {...invalid("email")} />
        {fieldError("email")}
      </div>
      <div className="field full">
        <label htmlFor="reason">I am reaching out as</label>
        <select id="reason" name="reason" defaultValue="community" data-testid="select-contact-reason">
          {reasons.map((reason) => (
            <option key={reason.value} value={reason.value}>{reason.label}</option>
          ))}
        </select>
      </div>
      <div className="field full">
        <label htmlFor="message">Conversation or partnership interest</label>
        <textarea
          id="message"
          name="message"
          required
          maxLength={5000}
          placeholder="Share the question, community priority or contribution you would like to discuss."
          data-testid="textarea-contact-message"
          {...invalid("message")}
        />
        {fieldError("message")}
      </div>
      {status.kind === "sent" && <p className="success-note" role="status" data-testid="text-contact-success">{status.message}</p>}
      {status.kind === "error" && <p className="form-status-error" role="alert" data-testid="text-contact-error">{status.message}</p>}
      <div className="field full">
        <button className="button-primary" type="submit" disabled={sending} data-testid="button-contact-submit">
          {sending ? "Sending…" : "Send"} <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}
