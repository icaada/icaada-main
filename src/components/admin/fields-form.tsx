'use client';

import { useMemo, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminApiError, errorMessage } from '@/lib/admin/api-client';
import { uploadToCloudinary } from '@/lib/admin/cloudinary-upload';

/**
 * text/textarea/url/email/date map to strings; `list` is comma-separated and
 * `lines` one-per-line (both become string[]); `boolean` is a Yes/No select;
 * `asset` is a URL that can also be filled by uploading a file to Cloudinary.
 */
export type FieldKind = 'text' | 'textarea' | 'select' | 'date' | 'url' | 'email' | 'asset' | 'list' | 'lines' | 'boolean' | 'password';
export type FieldOption = string | { value: string; label: string };

export interface FieldConfig {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  options?: FieldOption[];
  placeholder?: string;
  help?: string;
  maxLength?: number;
  /** asset: form value that receives the Cloudinary public ID on upload. */
  publicIdField?: string;
  /** asset: Cloudinary sub-folder under icaada/. */
  uploadFolder?: string;
  /** asset: file input accept attribute. */
  accept?: string;
}

export const optionValue = (o: FieldOption) => (typeof o === 'string' ? o : o.value);
export const optionLabel = (o: FieldOption) => (typeof o === 'string' ? o : o.label);
const BOOLEAN_OPTIONS: FieldOption[] = [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }];
export const optionsFor = (f: FieldConfig) => (f.kind === 'boolean' ? BOOLEAN_OPTIONS : f.options ?? []);

function buildSchema(fields: FieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) {
    const max = f.maxLength ?? (f.kind === 'textarea' || f.kind === 'lines' ? 4000 : 200);
    shape[f.name] = z.string().superRefine((raw, ctx) => {
      const v = f.kind === 'password' ? raw : raw.trim();
      const fail = (message: string) => ctx.addIssue({ code: 'custom', message });
      if (!v) { if (f.required) fail(`${f.label} is required.`); return; }
      if (v.length > max) fail(`${f.label} must be ${max} characters or fewer.`);
      if (f.kind === 'url' || f.kind === 'asset') {
        try {
          const u = new URL(v);
          if (u.protocol !== 'http:' && u.protocol !== 'https:') fail(`${f.label} must start with http:// or https://.`);
        } catch { fail(`${f.label} must be a valid URL, for example https://example.org/file.`); }
      }
      if (f.kind === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) fail('Enter a valid email address.');
      if (f.kind === 'date' && Number.isNaN(Date.parse(v))) fail('Enter a valid date.');
      if ((f.kind === 'select' || f.kind === 'boolean') && !optionsFor(f).some((o) => optionValue(o) === v)) fail(`Choose a valid ${f.label.toLowerCase()}.`);
    });
    if (f.publicIdField) shape[f.publicIdField] = z.string();
  }
  return z.object(shape);
}

interface Props {
  fields: FieldConfig[];
  defaults: Record<string, string>;
  /** May be async. A rejected AdminApiError with field details is shown inline and keeps the form open. */
  onSubmit: (values: Record<string, string>) => void | Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  cancelLabel?: string;
  testPrefix: string;
}

export function FieldsForm({ fields, defaults, onSubmit, onCancel, submitLabel, cancelLabel = 'Cancel', testPrefix }: Props) {
  const schema = useMemo(() => buildSchema(fields), [fields]);
  const form = useForm<Record<string, string>>({
    resolver: zodResolver(schema) as Resolver<Record<string, string>>,
    defaultValues: Object.fromEntries(
      fields.flatMap((f) => [
        [f.name, defaults[f.name] ?? ''],
        ...(f.publicIdField ? [[f.publicIdField, defaults[f.publicIdField] ?? '']] : []),
      ]),
    ),
  });
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadNote, setUploadNote] = useState<Record<string, string>>({});
  const [failedPreview, setFailedPreview] = useState('');
  const [rootError, setRootError] = useState<string | null>(null);
  const busy = form.formState.isSubmitting || uploading !== null;

  const submit = form.handleSubmit(async (values) => {
    setRootError(null);
    try {
      const passwordFields = new Set(fields.filter((f) => f.kind === 'password').map((f) => f.name));
      await onSubmit(Object.fromEntries(Object.entries(values).map(([k, v]) => [k, passwordFields.has(k) ? v : v.trim()])));
    } catch (error) {
      const unmatched: string[] = [];
      if (error instanceof AdminApiError && error.details) {
        for (const [path, messages] of Object.entries(error.details)) {
          const name = path.split('.')[0];
          if (fields.some((f) => f.name === name)) form.setError(name, { message: messages.join(' ') });
          else unmatched.push(...messages);
        }
      }
      setRootError(unmatched.length ? `${errorMessage(error)} ${unmatched.join(' ')}` : errorMessage(error));
    }
  });

  const upload = async (f: FieldConfig, file: File) => {
    setUploading(f.name);
    setUploadNote((n) => ({ ...n, [f.name]: `Uploading ${file.name}…` }));
    try {
      const asset = await uploadToCloudinary(file, f.uploadFolder ?? 'uploads');
      form.setValue(f.name, asset.url, { shouldValidate: true, shouldDirty: true });
      if (f.publicIdField) form.setValue(f.publicIdField, asset.publicId, { shouldDirty: true });
      setUploadNote((n) => ({ ...n, [f.name]: `Uploaded ${file.name}.` }));
    } catch (error) {
      setUploadNote((n) => ({ ...n, [f.name]: '' }));
      form.setError(f.name, { message: errorMessage(error) });
    } finally {
      setUploading(null);
    }
  };

  return (
    <Form {...form}>
      <form className="adm-form" noValidate onSubmit={submit} data-testid={`form-${testPrefix}`}>
        {fields.map((f) => (
          <FormField
            key={f.name}
            control={form.control}
            name={f.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{f.label}{f.required && <span className="adm-req" aria-hidden="true"> *</span>}</FormLabel>
                <FormControl>
                  {f.kind === 'textarea' || f.kind === 'lines' ? (
                    <Textarea {...field} rows={f.name === 'body' || f.name === 'biography' ? 7 : 4} placeholder={f.placeholder} data-testid={`input-${testPrefix}-${f.name}`} />
                  ) : f.kind === 'select' || f.kind === 'boolean' ? (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger data-testid={`select-${testPrefix}-${f.name}`}><SelectValue placeholder={`Choose ${f.label.toLowerCase()}`} /></SelectTrigger></FormControl>
                      <SelectContent className="adm-select-content">
                        {optionsFor(f).map((o) => <SelectItem key={optionValue(o)} value={optionValue(o)} data-testid={`option-${testPrefix}-${f.name}-${optionValue(o)}`}>{optionLabel(o)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        // A hand-typed URL no longer matches the uploaded asset.
                        if (f.publicIdField) form.setValue(f.publicIdField, '');
                      }}
                      type={f.kind === 'date' ? 'date' : f.kind === 'password' ? 'password' : 'text'}
                      autoComplete={f.kind === 'password' ? (f.name === 'currentPassword' ? 'current-password' : 'new-password') : undefined}
                      inputMode={f.kind === 'email' ? 'email' : f.kind === 'url' || f.kind === 'asset' ? 'url' : undefined}
                      placeholder={f.placeholder}
                      data-testid={`input-${testPrefix}-${f.name}`}
                    />
                  )}
                </FormControl>
                {f.kind === 'asset' && (
                  <div className="adm-asset">
                    <label className="adm-file">
                      <span>{uploading === f.name ? 'Uploading…' : 'Or upload a file'}</span>
                      <input
                        type="file"
                        accept={f.accept ?? 'image/*,video/*,audio/*,application/pdf'}
                        disabled={busy}
                        data-testid={`input-${testPrefix}-${f.name}-file`}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (file) void upload(f, file);
                        }}
                      />
                    </label>
                    {uploadNote[f.name] && <small role="status" data-testid={`text-upload-${f.name}`}>{uploadNote[f.name]}</small>}
                    {field.value && field.value.includes('/image/upload/') && failedPreview !== field.value && (
                      // eslint-disable-next-line @next/next/no-img-element -- small admin preview of an arbitrary URL
                      <img className="adm-asset-preview" src={field.value} alt="Preview of the asset" onError={() => setFailedPreview(field.value)} data-testid={`img-preview-${f.name}`} />
                    )}
                    {field.value && failedPreview === field.value && <p role="status">Image preview unavailable. Check the URL.</p>}
                  </div>
                )}
                {f.help && <FormDescription>{f.help}</FormDescription>}
                <FormMessage data-testid={`error-${testPrefix}-${f.name}`} />
              </FormItem>
            )}
          />
        ))}
        {rootError && <p className="adm-form-error" role="alert" data-testid={`error-${testPrefix}-form`}>{rootError}</p>}
        <div className="adm-form-actions">
          <button type="button" className="adm-btn" onClick={onCancel} disabled={form.formState.isSubmitting} data-testid={`button-cancel-${testPrefix}`}>{cancelLabel}</button>
          <button type="submit" className="adm-btn is-primary" disabled={busy} data-testid={`button-submit-${testPrefix}`}>{form.formState.isSubmitting ? 'Saving…' : submitLabel}</button>
        </div>
      </form>
    </Form>
  );
}
