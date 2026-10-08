import { optionLabel, optionValue, optionsFor, type FieldConfig } from '@/components/admin/fields-form';

// Converts between API DTO values (strings, arrays, booleans, ISO dates, null)
// and the string-only values FieldsForm edits.

const splitList = (value: string, separator: RegExp) =>
  value.split(separator).map((item) => item.trim()).filter(Boolean);

/** DTO → form defaults. */
export function toFormValues(fields: FieldConfig[], record: Record<string, unknown>): Record<string, string> {
  const values: Record<string, string> = {};
  for (const f of fields) {
    const raw = record[f.name];
    if (raw === null || raw === undefined) values[f.name] = '';
    else if (Array.isArray(raw)) values[f.name] = raw.join(f.kind === 'lines' ? '\n' : ', ');
    else if (typeof raw === 'boolean') values[f.name] = String(raw);
    else if (f.kind === 'date') values[f.name] = String(raw).slice(0, 10);
    else values[f.name] = String(raw);
    if (f.publicIdField) values[f.publicIdField] = String(record[f.publicIdField] ?? '');
  }
  return values;
}

/** Form values → API payload. Empty optional fields become null so they clear. */
export function toPayload(fields: FieldConfig[], values: Record<string, string>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const f of fields) {
    const v = values[f.name] ?? '';
    if (f.kind === 'list') payload[f.name] = splitList(v, /,/);
    else if (f.kind === 'lines') payload[f.name] = splitList(v, /\r?\n/);
    else if (f.kind === 'boolean') payload[f.name] = v === 'true';
    else payload[f.name] = v === '' && !f.required ? null : v;
    if (f.publicIdField) payload[f.publicIdField] = values[f.publicIdField] || null;
  }
  return payload;
}

/** Human-readable cell/detail value. */
export function displayValue(field: FieldConfig | undefined, value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (field && (field.kind === 'select' || field.kind === 'boolean')) {
    const option = optionsFor(field).find((o) => optionValue(o) === String(value));
    if (option) return optionLabel(option);
  }
  if (field?.kind === 'date') {
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  return String(value);
}
