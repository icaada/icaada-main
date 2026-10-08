import { useMemo, useState } from 'react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { ConfirmDialog, DemoNotice, DetailDialog, EmptyState, FormDialog, PageHeading, StatusBadge, Toolbar } from '@/components/admin/admin-parts';
import type { FieldConfig } from '@/components/admin/fields-form';
import { formatWhen, useDemo } from '@/lib/admin/demo-store';
import type { NewsletterDraft, Subscriber } from '@/data/admin/mock';

const subscriberFields: FieldConfig[] = [
  { name: 'name', label: 'Name', kind: 'text', required: true },
  { name: 'email', label: 'Email', kind: 'email', required: true, placeholder: 'name@example.org' },
  { name: 'status', label: 'Status', kind: 'select', required: true, options: ['subscribed', 'unsubscribed'] },
];
const draftFields: FieldConfig[] = [
  { name: 'subject', label: 'Subject', kind: 'text', required: true },
  { name: 'body', label: 'Body', kind: 'textarea', required: true },
];
const filters = [
  { value: 'all', label: 'All' },
  { value: 'subscribed', label: 'Subscribed' },
  { value: 'unsubscribed', label: 'Unsubscribed' },
];

export default function AdminNewsletter() {
  const { subscribers, drafts, saveSubscriber, setSubscriberStatus, removeSubscriber, saveDraft, removeDraft } = useDemo();
  const [tab, setTab] = useState<'subscribers' | 'drafts'>('subscribers');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [subEdit, setSubEdit] = useState<Subscriber | 'new' | null>(null);
  const [subDelete, setSubDelete] = useState<Subscriber | null>(null);
  const [draftEdit, setDraftEdit] = useState<NewsletterDraft | 'new' | null>(null);
  const [draftDelete, setDraftDelete] = useState<NewsletterDraft | null>(null);
  const [preview, setPreview] = useState<NewsletterDraft | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subscribers.filter((s) => (status === 'all' || s.status === status) && (!q || `${s.name} ${s.email}`.toLowerCase().includes(q)));
  }, [subscribers, search, status]);
  const reset = () => { setSearch(''); setStatus('all'); };
  const activeCount = subscribers.filter((s) => s.status === 'subscribed').length;

  return (
    <AdminLayout>
      <div className="adm-page" data-testid="page-newsletter">
        <PageHeading
          kicker="Engagement" title="Newsletter" lede="Manage demo subscribers and draft issues. Sending is not available in this workspace."
          actions={tab === 'subscribers'
            ? <button type="button" className="adm-btn is-primary" onClick={() => setSubEdit('new')} data-testid="button-add-subscriber"><Plus size={16} aria-hidden="true" /> Add subscriber</button>
            : <button type="button" className="adm-btn is-primary" onClick={() => setDraftEdit('new')} data-testid="button-add-draft"><Plus size={16} aria-hidden="true" /> New draft</button>}
        />
        <DemoNotice />
        <div className="adm-tabs" role="group" aria-label="Newsletter sections">
          <button type="button" aria-pressed={tab === 'subscribers'} className={tab === 'subscribers' ? 'is-active' : ''} onClick={() => setTab('subscribers')} data-testid="tab-subscribers">Subscribers <span data-testid="text-subscriber-count">{activeCount}/{subscribers.length}</span></button>
          <button type="button" aria-pressed={tab === 'drafts'} className={tab === 'drafts' ? 'is-active' : ''} onClick={() => setTab('drafts')} data-testid="tab-drafts">Drafts <span data-testid="text-draft-count">{drafts.length}</span></button>
        </div>

        {tab === 'subscribers' ? (
          <>
            <Toolbar search={search} onSearch={setSearch} status={status} onStatus={setStatus} options={filters} searchLabel="Search subscribers" />
            {filtered.length === 0 ? (
              <EmptyState title={subscribers.length ? 'No subscribers match' : 'No subscribers yet'} text={subscribers.length ? 'Try a different search or status.' : 'Add a demo subscriber to begin.'} onReset={subscribers.length ? reset : undefined} action={!subscribers.length ? <button type="button" className="adm-btn is-primary" onClick={() => setSubEdit('new')} data-testid="button-add-empty">Add subscriber</button> : undefined} />
            ) : (
              <div className="adm-table is-subs" role="table" aria-label="Subscribers">
                <div className="adm-row is-head" role="row"><span>Name</span><span>Email</span><span>Status</span><span>Actions</span></div>
                {filtered.map((s) => (
                  <div className="adm-row" role="row" key={s.id} data-testid={`row-subscriber-${s.id}`}>
                    <span className="adm-cell-title"><strong>{s.name}</strong><small>Updated {formatWhen(s.updatedAt)}</small></span>
                    <span className="adm-cell-clip" data-label="Email">{s.email}</span>
                    <span data-label="Status"><StatusBadge status={s.status} testId={`status-${s.id}`} /></span>
                    <span className="adm-cell-actions">
                      <button type="button" className="adm-btn is-small" onClick={() => setSubscriberStatus(s.id, s.status === 'subscribed' ? 'unsubscribed' : 'subscribed')} data-testid={`button-toggle-${s.id}`}>{s.status === 'subscribed' ? 'Unsubscribe' : 'Resubscribe'}</button>
                      <button type="button" className="adm-icon" aria-label={`Edit ${s.name}`} title="Edit" onClick={() => setSubEdit(s)} data-testid={`button-edit-${s.id}`}><Pencil size={16} aria-hidden="true" /></button>
                      <button type="button" className="adm-icon is-danger" aria-label={`Remove ${s.name}`} title="Remove" onClick={() => setSubDelete(s)} data-testid={`button-delete-${s.id}`}><Trash2 size={16} aria-hidden="true" /></button>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : drafts.length === 0 ? (
          <EmptyState title="No newsletter drafts" text="Create a draft to compose and preview an issue." action={<button type="button" className="adm-btn is-primary" onClick={() => setDraftEdit('new')} data-testid="button-add-empty-draft">New draft</button>} />
        ) : (
          <ul className="adm-list">
            {drafts.map((d) => (
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
      </div>

      {subEdit && (
        <FormDialog open title={subEdit === 'new' ? 'Add subscriber' : 'Edit subscriber'} description="Use a reserved example.org address for demo data. Cancel discards changes."
          fields={subscriberFields} defaults={subEdit === 'new' ? { status: 'subscribed' } : { name: subEdit.name, email: subEdit.email, status: subEdit.status }}
          submitLabel={subEdit === 'new' ? 'Add subscriber' : 'Save changes'} testPrefix="subscriber" onClose={() => setSubEdit(null)}
          onSubmit={(v) => { saveSubscriber(subEdit === 'new' ? null : subEdit.id, v); setSubEdit(null); }} />
      )}
      {draftEdit && (
        <FormDialog open title={draftEdit === 'new' ? 'New newsletter draft' : 'Edit newsletter draft'} description="Drafts stay in this browser tab. There is no send action."
          fields={draftFields} defaults={draftEdit === 'new' ? {} : { subject: draftEdit.subject, body: draftEdit.body }}
          submitLabel={draftEdit === 'new' ? 'Create draft' : 'Save draft'} testPrefix="draft" onClose={() => setDraftEdit(null)}
          onSubmit={(v) => { saveDraft(draftEdit === 'new' ? null : draftEdit.id, v); setDraftEdit(null); }} />
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

      <ConfirmDialog open={!!subDelete} title="Remove this subscriber?" description={subDelete ? `${subDelete.email} will be removed from this demo session.` : ''} confirmLabel="Remove" onCancel={() => setSubDelete(null)} onConfirm={() => { if (subDelete) removeSubscriber(subDelete.id); setSubDelete(null); }} />
      <ConfirmDialog open={!!draftDelete} title="Delete this draft?" description={draftDelete ? `"${draftDelete.subject}" will be removed from this demo session.` : ''} onCancel={() => setDraftDelete(null)} onConfirm={() => { if (draftDelete) removeDraft(draftDelete.id); setDraftDelete(null); }} />
    </AdminLayout>
  );
}
