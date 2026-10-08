import { HONEYPOT_NAME } from '@/lib/public-form';

/** Hidden spam trap: people never see or fill it; bots that do are silently ignored by the API. */
export function Honeypot() {
  return (
    <div className="form-honeypot" aria-hidden="true">
      <label htmlFor={`hp-${HONEYPOT_NAME}`}>Leave this field empty</label>
      <input id={`hp-${HONEYPOT_NAME}`} name={HONEYPOT_NAME} type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
