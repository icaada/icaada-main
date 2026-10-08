"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Honeypot } from "@/components/public/honeypot";
import { HONEYPOT_NAME, submitPublicForm } from "@/lib/public-form";

const interests = [
  "Community prevention",
  "Youth engagement",
  "Family support",
  "Events and outreach",
  "Research and data",
  "Media and communications",
];

const states = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; message: string } | { kind: "error"; message: string };

/** Posts to /api/public/volunteers; applications appear under Volunteers in the admin. */
export function VolunteerForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const chosen = data.getAll("interests").map(String);
    if (chosen.length === 0) {
      setErrors({ interests: "Choose at least one area of interest." });
      setStatus({ kind: "error", message: "Please check the highlighted fields." });
      return;
    }
    setStatus({ kind: "sending" });
    const result = await submitPublicForm("volunteers", {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      state: String(data.get("state") ?? ""),
      lga: String(data.get("lga") ?? ""),
      interests: chosen,
      availability: String(data.get("availability") ?? ""),
      message: String(data.get("message") ?? ""),
      [HONEYPOT_NAME]: String(data.get(HONEYPOT_NAME) ?? ""),
    });
    if (result.ok) {
      form.reset();
      setErrors({});
      setStatus({ kind: "sent", message: result.message });
    } else {
      setErrors(result.fieldErrors);
      setStatus({ kind: "error", message: result.message });
    }
  };

  const fieldError = (name: string) =>
    errors[name] ? <small id={`volunteer-${name}-error`} className="field-error" role="alert">{errors[name]}</small> : null;
  const invalid = (name: string) => ({
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `volunteer-${name}-error` : undefined,
  });
  const sending = status.kind === "sending";

  return (
    <form className="contact-form" onSubmit={submit} data-testid="form-volunteer">
      <Honeypot />
      <div className="field">
        <label htmlFor="volunteer-name">Full name</label>
        <input id="volunteer-name" name="name" required maxLength={120} autoComplete="name" data-testid="input-volunteer-name" {...invalid("name")} />
        {fieldError("name")}
      </div>
      <div className="field">
        <label htmlFor="volunteer-email">Email address</label>
        <input id="volunteer-email" name="email" type="email" required maxLength={254} autoComplete="email" data-testid="input-volunteer-email" {...invalid("email")} />
        {fieldError("email")}
      </div>
      <div className="field">
        <label htmlFor="volunteer-phone">Phone (optional)</label>
        <input id="volunteer-phone" name="phone" type="tel" maxLength={20} autoComplete="tel" placeholder="+234 …" data-testid="input-volunteer-phone" {...invalid("phone")} />
        {fieldError("phone")}
      </div>
      <div className="field">
        <label htmlFor="volunteer-state">State</label>
        <select id="volunteer-state" name="state" required defaultValue="" data-testid="select-volunteer-state" {...invalid("state")}>
          <option value="" disabled>Choose your state</option>
          {states.map((state) => <option key={state} value={state}>{state}</option>)}
        </select>
        {fieldError("state")}
      </div>
      <div className="field">
        <label htmlFor="volunteer-lga">Local government area (optional)</label>
        <input id="volunteer-lga" name="lga" maxLength={80} data-testid="input-volunteer-lga" {...invalid("lga")} />
        {fieldError("lga")}
      </div>
      <div className="field">
        <label htmlFor="volunteer-availability">Availability (optional)</label>
        <input id="volunteer-availability" name="availability" maxLength={200} placeholder="e.g. Weekends, two evenings a week" data-testid="input-volunteer-availability" {...invalid("availability")} />
        {fieldError("availability")}
      </div>
      <fieldset className="field full" aria-describedby={errors.interests ? "volunteer-interests-error" : undefined}>
        <legend className="field-legend">Areas of interest</legend>
        <div className="checkbox-grid">
          {interests.map((interest) => (
            <label key={interest} className="checkbox-option">
              <input type="checkbox" name="interests" value={interest} data-testid={`checkbox-volunteer-${interest.toLowerCase().replaceAll(" ", "-")}`} />
              {interest}
            </label>
          ))}
        </div>
        {fieldError("interests")}
      </fieldset>
      <div className="field full">
        <label htmlFor="volunteer-message">Anything else we should know? (optional)</label>
        <textarea id="volunteer-message" name="message" maxLength={3000} placeholder="Skills, languages, experience or how you would like to help." data-testid="textarea-volunteer-message" {...invalid("message")} />
        {fieldError("message")}
      </div>
      {status.kind === "sent" && <p className="success-note" role="status" data-testid="text-volunteer-success">{status.message}</p>}
      {status.kind === "error" && <p className="form-status-error" role="alert" data-testid="text-volunteer-error">{status.message}</p>}
      <div className="field full">
        <button className="button-primary" type="submit" disabled={sending} data-testid="button-volunteer-submit">
          {sending ? "Sending…" : "Volunteer with ICAADA"} <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}
