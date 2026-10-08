'use client';

import { useState } from 'react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { ConfirmDialog, DetailDialog, EmptyState, FormDialog, ListStatus, PageHeading, StatusBadge, Toolbar } from '@/components/admin/admin-parts';
import type { FieldConfig } from '@/components/admin/fields-form';
import { adminApi, errorMessage } from '@/lib/admin/api-client';
import { useAdmin } from '@/lib/admin/admin-store';
import { formatWhen } from '@/lib/admin/format';
import { useAdminList } from '@/lib/admin/use-admin-list';
import type { NewsletterDraftDto } from '@/Services/newsletter.service';
import type { SubscriberDto } from '@/Services/subscriber.service';

const statusOptions = [{ value: 'SUBSCRIBED', label: 'Subscribed' }, { value: 'UNSUBSCRIBED', label: 'Unsubscribed' }];
const subscriberCreateFields: FieldConfig[] = [
  { name: 'email', label: 'Email', kind: 'email', required: true, placeholder: 'name@example.org' },
  { name: 'name', label: 'Name', kind: 'text', maxLength: 120 },
  { name: 'status', label: 'Status', kind: 'select', required: true, options: statusOptions },
];
// The address is the subscriber's identity, so it is not editable; remove and re-add instead.
const subscriberEditFields: FieldConfig[] = subscriberCreateFields.filter((f) => f.name !== 'email');
const draftFields: FieldConfig[] = [
  { name: 'subject', label: 'Subject', kind: 'text', required: true },
  { name: 'body', label: 'Body', kind: 'textarea', required: true, maxLength: 50000 },
];
const filters = [
  { value: 'all', label: 'All' },
  { value: 'SUBSCRIBED', label: 'Subscribed' },
  { value: 'UNSUBSCRIBED', label: 'Unsubscribed' },
];

export default function AdminNewsletter() {
  const { notify, refreshSummary } = useAdmin();
  const [tab, setTab] = useState<'subscribers' | 'drafts'>('subscribers');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [subEdit, setSubEdit] = useState<SubscriberDto | 'new' | null>(null);
  const [subDelete, setSubDelete] = useState<SubscriberDto | null>(null);
  const [draftEdit, setDraftEdit] = useState<NewsletterDraftDto | 'new' | null>(null);
  const [draftDelete, setDraftDelete] = useState<NewsletterDraftDto | null>(null);
  const [preview, setPreview] = useState<NewsletterDraftDto | null>(null);

  const subs = useAdminList<SubscriberDto>('/admin/subscribers', { search, status: status === 'all' ? undefined : status });
  const drafts = useAdminList<NewsletterDraftDto>('/admin/newsletter');
  const subscribers = subs.items;
  const filtersActive = search !== '' || status !== 'all';
  const activeCount = Number(subs.meta?.subscribed ?? 0);
  const reset = () => { setSearch(''); setStatus('all'); };

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      notify(success);
      void refreshSummary();
    } catch (error) {
      notify(errorMessage(error), 'danger');
    }
  };

  const saveSubscriber = async (values: Record<string, string>) => {
    if (subEdit === 'new') {
      await adminApi.post('/admin/subscribers', { email: values.email, name: values.name || null, status: values.status });
      notify(`Added ${values.email}.`);
    } else if (subEdit) {
      const { data } = await adminApi.patch<SubscriberDto>(`/admin/subscribers/${subEdit.id}`, { name: values.name || null, status: values.status });
      notify(`Saved ${data.email}.`);
    }
    setSubEdit(null);
    subs.reload();
    void refreshSummary();
  };

  const saveDraft = async (values: Record<string, string>) => {
    if (draftEdit === 'new') {
      await adminApi.post('/admin/newsletter', values);
      notify('Draft created.');
      drafts.reload();
    } else if (draftEdit) {
      const { data } = await adminApi.patch<NewsletterDraftDto>(`/admin/newsletter/${draftEdit.id}`, values);
      drafts.replaceItem(data);
      notify('Draft saved.');
    }
    setDraftEdit(null);
  };

  return (
    <>
      <div className="adm-page" data-testid="page-newsletter">
        <PageHeading
          kicker="Engagement" title="Newsletter" lede="Manage subscribers and draft issues. Sending is not available yet."
          actions={tab === 'subscribers'
            ? <button type="button" className="adm-btn is-primary" onClick={() => setSubEdit('new')} data-testid="button-add-subscriber"><Plus size={16} aria-hidden="true" /> Add subscriber</button>
            : <button type="button" className="adm-btn is-primary" onClick={() => setDraftEdit('new')} data-testid="button-add-draft"><Plus size={16} aria-hidden="true" /> New draft</button>}
        />
        <div className="adm-tabs" role="group" aria-label="Newsletter sections">
          <button type="button" aria-pressed={tab === 'subscribers'} className={tab === 'subscribers' ? 'is-active' : ''} onClick={() => setTab('subscribers')} data-testid="tab-subscribers">Subscribers <span data-testid="text-subscriber-count">{activeCount} active</span></button>
          <button type="button" aria-pressed={tab === 'drafts'} className={tab === 'drafts' ? 'is-active' : ''} onClick={() => setTab('drafts')} data-testid="tab-drafts">Drafts <span data-testid="text-draft-count">{drafts.meta?.total ?? 0}</span></button>
        </div>

        {tab === 'subscribers' ? (
          <>
            <Toolbar search={search} onSearch={setSearch} status={status} onStatus={setStatus} options={filters} searchLabel="Search subscribers" />
            {!subs.loading && !subs.error && subscribers.length === 0 ? (
              <EmptyState title={filtersActive ? 'No subscribers match' : 'No subscribers yet'} text={filtersActive ? 'Try a different search or status.' : 'People who sign up on the website appear here. You can also add someone manually.'} onReset={filtersActive ? reset : undefined} action={!filtersActive ? <button type="button" className="adm-btn is-primary" onClick={() => setSubEdit('new')} data-testid="button-add-empty">Add subscriber</button> : undefined} />
            ) : subscribers.length > 0 && (
              <div className="adm-table is-subs" role="table" aria-label="Subscribers">
                <div className="adm-row is-head" role="row"><span>Name</span><span>Email</span><span>Status</span><span>Actions</span></div>
                {subscribers.map((s) => (
                  <div className="adm-row" role="row" key={s.id} data-testid={`row-subscriber-${s.id}`}>
                    <span className="adm-cell-title"><strong>{s.name || '—'}</strong><small>Updated {formatWhen(s.updatedAt)}</small></span>
                    <span className="adm-cell-clip" data-label="Email">{s.email}</span>
                    <span data-label="Status"><StatusBadge status={s.status} testId={`status-${s.id}`} /></span>
                    <span className="adm-cell-actions">
                      <button type="button" className="adm-btn is-small" onClick={() => run(async () => {
                        const { data } = await adminApi.patch<SubscriberDto>(`/admin/subscribers/${s.id}`, { status: s.status === 'SUBSCRIBED' ? 'UNSUBSCRIBED' : 'SUBSCRIBED' });
                        if (status !== 'all' && data.status !== status) subs.removeItem(data.id); else subs.replaceItem(data);
                        subs.reload();
                      }, s.status === 'SUBSCRIBED' ? `Unsubscribed ${s.email}.` : `Resubscribed ${s.email}.`)} data-testid={`button-toggle-${s.id}`}>{s.status === 'SUBSCRIBED' ? 'Unsubscribe' : 'Resubscribe'}</button>
                      <button type="button" className="adm-icon" aria-label={`Edit ${s.email}`} title="Edit" onClick={() => setSubEdit(s)} data-testid={`button-edit-${s.id}`}><Pencil size={16} aria-hidden="true" /></button>
                      <button type="button" className="adm-icon is-danger" aria-label={`Remove ${s.email}`} title="Remove" onClick={() => setSubDelete(s)} data-testid={`button-delete-${s.id}`}><Trash2 size={16} aria-hidden="true" /></button>
                    </span>
                  </div>
                ))}
              </div>
            )}
            <ListStatus loading={subs.loading} error={subs.error} hasMore={subs.hasMore} onRetry={subs.reload} onLoadMore={subs.loadMore} />
          </>
        ) : (
          <>
            {!drafts.loading && !drafts.error && drafts.items.length === 0 ? (
              <EmptyState title="No newsletter drafts" text="Create a draft to compose and preview an issue." action={<button type="button" className="adm-btn is-primary" onClick={() => setDraftEdit('new')} data-testid="button-add-empty-draft">New draft</button>} />
            ) : (
              <ul className="adm-list">
                {drafts.items.map((d) => (
                  <li key={d.id} className="adm-message" data-testid={`row-draft-${d.id}`}>
                    <div className="adm-message-main is-static">
                      <span className="adm-message-top"><strong>{d.subject}</strong><small>Updated {formatWhen(d.updatedAt)}</small></span>
                      <span className="adm-message-snippet">{d.body}</span>
                    </div>
                    <div className="adm-message-side">
                      <StatusBadge status="draft" />
                      <div className="adm-cell-actions">
                        <button type="button" className="adm-icon" aria-label="Preview draft" title="Preview" onClick={() => setPreview(d)} data-testid={`button-preview-${d.id}`}><Eye size={16} aria-hidden="true" /></button>
                        <button type="button" className="adm-icon" aria-label="Edit draft" title="Edit" onClick={() => setDraftEdit(d)} data-testid={`button-edit-${d.id}`}><Pencil size={16} aria-hidden="true" /></button>
                        <button type="button" className="adm-icon is-danger" aria-label="Delete draft" title="Delete" onClick={() => setDraftDelete(d)} data-testid={`button-delete-${d.id}`}><Trash2 size={16} aria-hidden="true" /></button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <ListStatus loading={drafts.loading} error={drafts.error} hasMore={drafts.hasMore} onRetry={drafts.reload} onLoadMore={drafts.loadMore} />
          </>
        )}
      </div>

      {subEdit && (
        <FormDialog open title={subEdit === 'new' ? 'Add subscriber' : `Edit ${subEdit.email}`} description={subEdit === 'new' ? 'Only add people who have agreed to receive the newsletter.' : 'To change the address, remove this subscriber and add the new one.'}
          fields={subEdit === 'new' ? subscriberCreateFields : subscriberEditFields} defaults={subEdit === 'new' ? { status: 'SUBSCRIBED' } : { name: subEdit.name ?? '', status: subEdit.status }}
          submitLabel={subEdit === 'new' ? 'Add subscriber' : 'Save changes'} testPrefix="subscriber" onClose={() => setSubEdit(null)}
          onSubmit={saveSubscriber} />
      )}
      {draftEdit && (
        <FormDialog open title={draftEdit === 'new' ? 'New newsletter draft' : 'Edit newsletter draft'} description="Drafts are saved to the workspace. There is no send action yet."
          fields={draftFields} defaults={draftEdit === 'new' ? {} : { subject: draftEdit.subject, body: draftEdit.body }}
          submitLabel={draftEdit === 'new' ? 'Create draft' : 'Save draft'} testPrefix="draft" onClose={() => setDraftEdit(null)}
          onSubmit={saveDraft} />
      )}

      <DetailDialog open={!!preview} onClose={() => setPreview(null)} testId="dialog-preview" title="Newsletter preview" description="How the draft reads. Preview only, nothing is sent."
        footer={preview && <button type="button" className="adm-btn is-small" disabled data-testid="button-send-disabled">Send (unavailable)</button>}>
        {preview && (
          <article className="adm-preview" data-testid="preview-newsletter">
            <small>Subject</small>
            <h3>{preview.subject}</h3>
            {preview.body.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
          </article>
        )}
      </DetailDialog>

      <ConfirmDialog open={!!subDelete} title="Remove this subscriber?" description={subDelete ? `${subDelete.email} will be permanently removed from the list.` : ''} confirmLabel="Remove" onCancel={() => setSubDelete(null)}
        onConfirm={() => { const s = subDelete; setSubDelete(null); if (s) void run(async () => { await adminApi.del(`/admin/subscribers/${s.id}`); subs.removeItem(s.id); subs.reload(); }, `Removed ${s.email}.`); }} />
      <ConfirmDialog open={!!draftDelete} title="Delete this draft?" description={draftDelete ? `"${draftDelete.subject}" will be permanently deleted.` : ''} onCancel={() => setDraftDelete(null)}
        onConfirm={() => { const d = draftDelete; setDraftDelete(null); if (d) void run(async () => { await adminApi.del(`/admin/newsletter/${d.id}`); drafts.removeItem(d.id); }, 'Draft deleted.'); }} />
    </>
  );
}
