import { useMemo, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type FieldKind = 'text' | 'textarea' | 'select' | 'date' | 'url' | 'email' | 'asset';
export interface FieldConfig {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  help?: string;
  maxLength?: number;
}

function buildSchema(fields: FieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) {
    const max = f.maxLength ?? (f.kind === 'textarea' ? 4000 : 200);
    shape[f.name] = z.string().superRefine((raw, ctx) => {
      const v = raw.trim();
      const fail = (message: string) => ctx.addIssue({ code: 'custom', message });
      if (!v) { if (f.required) fail(`${f.label} is required.`); return; }
      if (v.length > max) fail(`${f.label} must be ${max} characters or fewer.`);
      if (f.kind === 'url' || f.kind === 'asset') {
        try {
          const u = new URL(v);
          const ok = u.protocol === 'http:' || u.protocol === 'https:' || (f.kind === 'asset' && u.protocol === 'blob:');
          if (!ok) fail(`${f.label} must start with http:// or https://.`);
        } catch { fail(`${f.label} must be a valid URL, for example https://example.org/file.`); }
      }
      if (f.kind === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) fail('Enter a valid email address.');
      if (f.kind === 'date' && Number.isNaN(Date.parse(v))) fail('Enter a valid date.');
       if (f.kind === 'select' && !f.options?.includes(v)) fail(`Choose a valid ${f.label.toLowerCase()}.`);
    });
  }
  return z.object(shape);
}

interface Props {
  fields: FieldConfig[];
  defaults: Record<string, string>;
  onSubmit: (values: Record<string, string>) => void;
  onCancel: () => void;
  submitLabel: string;
  cancelLabel?: string;
  testPrefix: string;
}

export function FieldsForm({ fields, defaults, onSubmit, onCancel, submitLabel, cancelLabel = 'Cancel', testPrefix }: Props) {
  const schema = useMemo(() => buildSchema(fields), [fields]);
  const form = useForm<Record<string, string>>({
    resolver: zodResolver(schema) as Resolver<Record<string, string>>,
    defaultValues: Object.fromEntries(fields.map((f) => [f.name, defaults[f.name] ?? ''])),
  });
  const [fileName, setFileName] = useState('');
  const [failedPreview, setFailedPreview] = useState('');
  const mediaType = form.watch('type');

  return (
    <Form {...form}>
      <form
        className="adm-form"
        noValidate
        onSubmit={form.handleSubmit((values) => onSubmit(Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()]))))}
        data-testid={`form-${testPrefix}`}
      >
        {fields.map((f) => (
          <FormField
            key={f.name}
            control={form.control}
            name={f.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{f.label}{f.required && <span className="adm-req" aria-hidden="true"> *</span>}</FormLabel>
                <FormControl>
                  {f.kind === 'textarea' ? (
                    <Textarea {...field} rows={f.name === 'body' ? 7 : 4} placeholder={f.placeholder} data-testid={`input-${testPrefix}-${f.name}`} />
                  ) : f.kind === 'select' ? (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger data-testid={`select-${testPrefix}-${f.name}`}><SelectValue placeholder={`Choose ${f.label.toLowerCase()}`} /></SelectTrigger></FormControl>
                      <SelectContent className="adm-select-content">
                        {f.options?.map((o) => <SelectItem key={o} value={o} data-testid={`option-${testPrefix}-${f.name}-${o}`}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      {...field}
                      type={f.kind === 'date' ? 'date' : 'text'}
                      inputMode={f.kind === 'email' ? 'email' : f.kind === 'url' || f.kind === 'asset' ? 'url' : undefined}
                      placeholder={f.placeholder}
                      data-testid={`input-${testPrefix}-${f.name}`}
                    />
                  )}
                </FormControl>
                {f.kind === 'asset' && (
                  <div className="adm-asset">
                    <label className="adm-file">
                      <span>Or choose a local file to preview</span>
                      <input
                        type="file"
                        accept="image/*,video/*,audio/*,application/pdf"
                        data-testid={`input-${testPrefix}-file`}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setFileName(file.name);
                          form.setValue(f.name, URL.createObjectURL(file), { shouldValidate: true, shouldDirty: true });
                        }}
                      />
                    </label>
                    {fileName && <small data-testid="text-local-file">Local preview only: {fileName}. Nothing is uploaded.</small>}
                    {mediaType === 'Image' && field.value && failedPreview !== field.value && (
                      <img className="adm-asset-preview" src={field.value} alt="Preview of the asset" onError={() => setFailedPreview(field.value)} data-testid="img-asset-preview" />
                    )}
                    {mediaType === 'Image' && field.value && failedPreview === field.value && <p role="status">Image preview unavailable. Check the URL or choose a local file.</p>}
                  </div>
                )}
                {f.help && <FormDescription>{f.help}</FormDescription>}
                <FormMessage data-testid={`error-${testPrefix}-${f.name}`} />
              </FormItem>
            )}
          />
        ))}
        <div className="adm-form-actions">
          <button type="button" className="adm-btn" onClick={onCancel} data-testid={`button-cancel-${testPrefix}`}>{cancelLabel}</button>
          <button type="submit" className="adm-btn is-primary" data-testid={`button-submit-${testPrefix}`}>{submitLabel}</button>
        </div>
      </form>
    </Form>
  );
}
