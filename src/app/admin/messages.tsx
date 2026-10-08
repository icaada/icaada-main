import { useMemo, useState } from 'react';
import { Archive, ArchiveRestore, Eye, MailOpen, MailCheck, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { ConfirmDialog, DemoNotice, DetailDialog, EmptyState, PageHeading, StatusBadge, Toolbar } from '@/components/admin/admin-parts';
import { formatWhen, useDemo } from '@/lib/admin/demo-store';

const filters = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
  { value: 'archived', label: 'Archived' },
];

export default function AdminMessages() {
  const { messages, patchMessage, removeMessage, notify } = useDemo();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState('');

  const viewing = messages.find((m) => m.id === viewingId) ?? null;
  const unread = messages.filter((m) => m.status === 'unread').length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return messages.filter((m) => (status === 'all' || m.status === status)
      && (!q || [m.name, m.email, m.subject, m.body].some((s) => s.toLowerCase().includes(q))));
  }, [messages, search, status]);

  const open = (id: string) => {
    const m = messages.find((x) => x.id === id);
    setDraftText(m?.replyDraft ?? '');
    setViewingId(id);
  };
  const reset = () => { setSearch(''); setStatus('all'); };

  return (
    <AdminLayout>
      <div className="adm-page" data-testid="page-messages">
        <PageHeading kicker="Engagement" title="Messages" lede="Triage demo enquiries. Replies are saved as local drafts and are never sent." actions={<span className="adm-pill" data-testid="text-unread-count">{unread} unread</span>} />
        <DemoNotice />
        <Toolbar search={search} onSearch={setSearch} status={status} onStatus={setStatus} options={filters} searchLabel="Search messages" />
        <p className="adm-count" data-testid="text-result-count">{filtered.length} of {messages.length} messages</p>

        {filtered.length === 0 ? (
          <EmptyState title={messages.length === 0 ? 'Inbox is empty' : 'No messages match'} text={messages.length === 0 ? 'Every demo message has been deleted. Refresh the page to restore the seed data.' : 'Try a different search or status.'} onReset={messages.length ? reset : undefined} />
        ) : (
          <ul className="adm-list">
            {filtered.map((m) => (
              <li key={m.id} className={`adm-message${m.status === 'unread' ? ' is-unread' : ''}`} data-testid={`row-message-${m.id}`}>
                <button type="button" className="adm-message-main" onClick={() => open(m.id)} data-testid={`button-open-${m.id}`}>
                  <span className="adm-message-top"><strong>{m.name}</strong><small>{formatWhen(m.receivedAt)}</small></span>
                  <span className="adm-message-subject">{m.subject}</span>
                  <span className="adm-message-snippet">{m.body}</span>
                </button>
                <div className="adm-message-side">
                  <StatusBadge status={m.status} testId={`status-${m.id}`} />
                  <div className="adm-cell-actions">
                    <button type="button" className="adm-icon" aria-label={m.status === 'unread' ? 'Mark as read' : 'Mark as unread'} title={m.status === 'unread' ? 'Mark as read' : 'Mark as unread'} onClick={() => patchMessage(m.id, { status: m.status === 'unread' ? 'read' : 'unread' }, m.status === 'unread' ? 'Marked read' : 'Marked unread')} data-testid={`button-toggle-read-${m.id}`}>{m.status === 'unread' ? <MailOpen size={16} aria-hidden="true" /> : <MailCheck size={16} aria-hidden="true" />}</button>
                    <button type="button" className="adm-icon" aria-label="View message" title="View" onClick={() => open(m.id)} data-testid={`button-view-${m.id}`}><Eye size={16} aria-hidden="true" /></button>
                    <button type="button" className="adm-icon is-danger" aria-label="Delete message" title="Delete" onClick={() => setDeletingId(m.id)} data-testid={`button-delete-${m.id}`}><Trash2 size={16} aria-hidden="true" /></button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DetailDialog
        open={!!viewing}
        onClose={() => setViewingId(null)}
        testId="dialog-message"
        title={viewing?.subject ?? 'Message'}
        description="Demo message details and local reply draft"
        footer={viewing && (
          <>
            <button type="button" className="adm-btn is-small" onClick={() => patchMessage(viewing.id, { status: viewing.status === 'unread' ? 'read' : 'unread' }, viewing.status === 'unread' ? 'Marked read' : 'Marked unread')} data-testid="button-details-toggle-read">{viewing.status === 'unread' ? 'Mark as read' : 'Mark as unread'}</button>
            {viewing.status === 'archived'
              ? <button type="button" className="adm-btn is-small" onClick={() => patchMessage(viewing.id, { status: 'read' }, 'Restored from archive')} data-testid="button-details-unarchive"><ArchiveRestore size={14} aria-hidden="true" /> Restore</button>
              : <button type="button" className="adm-btn is-small" onClick={() => patchMessage(viewing.id, { status: 'archived' }, 'Archived message')} data-testid="button-details-archive"><Archive size={14} aria-hidden="true" /> Archive</button>}
            <button type="button" className="adm-btn is-small is-danger" onClick={() => { setDeletingId(viewing.id); setViewingId(null); }} data-testid="button-details-delete">Delete</button>
          </>
        )}
      >
        {viewing && (
          <dl className="adm-detail">
            <div><dt>From</dt><dd data-testid="text-message-from">{viewing.name} &lt;{viewing.email}&gt;</dd></div>
            <div><dt>Received</dt><dd>{formatWhen(viewing.receivedAt)} <StatusBadge status={viewing.status} testId="status-message-details" /></dd></div>
            <div><dt>Message</dt><dd data-testid="text-message-body">{viewing.body}</dd></div>
            <div className="adm-reply">
              <label htmlFor="reply-draft">Reply draft</label>
              <textarea id="reply-draft" rows={5} value={draftText} onChange={(e) => setDraftText(e.target.value)} placeholder="Write a reply draft. It stays in this browser tab." data-testid="input-reply-draft" />
              <div className="adm-reply-actions">
                <small data-testid="text-reply-status">{viewing.replySavedAt ? `Draft saved locally ${formatWhen(viewing.replySavedAt)}. Not sent.` : 'No draft saved. Replies are never sent from the demo.'}</small>
                <button type="button" className="adm-btn is-small is-primary" onClick={() => {
                  if (!draftText.trim()) { notify('Write something before saving a draft.', 'danger'); return; }
                  patchMessage(viewing.id, { replyDraft: draftText.trim(), replySavedAt: new Date().toISOString() }, 'Saved reply draft locally');
                }} data-testid="button-save-reply">Save draft locally</button>
              </div>
            </div>
          </dl>
        )}
      </DetailDialog>

      <ConfirmDialog
        open={!!deletingId}
        title="Delete this message?"
        description="The message is removed from this demo session until you refresh the page."
        onCancel={() => setDeletingId(null)}
        onConfirm={() => { if (deletingId) removeMessage(deletingId); setDeletingId(null); }}
      />
    </AdminLayout>
  );
}
