'use client';

import { useState } from 'react';
import { Archive, ArchiveRestore, Eye, MailOpen, MailCheck, Trash2 } from 'lucide-react';
import { ConfirmDialog, DetailDialog, EmptyState, ListStatus, PageHeading, StatusBadge, Toolbar } from '@/components/admin/admin-parts';
import { adminApi, errorMessage } from '@/lib/admin/api-client';
import { useAdmin } from '@/lib/admin/admin-store';
import { formatWhen } from '@/lib/admin/format';
import { useAdminList } from '@/lib/admin/use-admin-list';
import type { MessageStatus } from '@/Schemas/contact.schema';
import type { ContactMessageDto } from '@/Services/contact-message.service';

const filters = [
  { value: 'all', label: 'All' },
  { value: 'NEW', label: 'Unread' },
  { value: 'READ', label: 'Read' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export default function AdminMessages() {
  const { notify, refreshSummary } = useAdmin();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState('');
  const [savingDraft, setSavingDraft] = useState(false);

  const list = useAdminList<ContactMessageDto>('/admin/messages', { search, status: status === 'all' ? undefined : status });
  const messages = list.items;
  const total = list.meta?.total ?? 0;
  const unread = Number(list.meta?.unread ?? 0);
  const filtersActive = search !== '' || status !== 'all';
  const viewing = messages.find((m) => m.id === viewingId) ?? null;

  const open = (m: ContactMessageDto) => {
    setDraftText(m.replyDraft ?? '');
    setViewingId(m.id);
  };
  const reset = () => { setSearch(''); setStatus('all'); };

  const patchMessage = async (m: ContactMessageDto, body: { status?: MessageStatus; replyDraft?: string }, success: string) => {
    try {
      const { data } = await adminApi.patch<ContactMessageDto>(`/admin/messages/${m.id}`, body);
      if (status !== 'all' && data.status !== status) list.removeItem(data.id);
      else list.replaceItem(data);
      if (body.status) list.reload(); // refresh the unread count in meta
      notify(success);
      void refreshSummary();
      return data;
    } catch (error) {
      notify(errorMessage(error), 'danger');
      return null;
    }
  };

  const remove = async (id: string) => {
    try {
      await adminApi.del(`/admin/messages/${id}`);
      list.removeItem(id);
      notify('Message deleted.');
      void refreshSummary();
    } catch (error) {
      notify(errorMessage(error), 'danger');
    }
  };

  const toggleRead = (m: ContactMessageDto) =>
    patchMessage(m, { status: m.status === 'NEW' ? 'READ' : 'NEW' }, m.status === 'NEW' ? 'Marked read.' : 'Marked unread.');

  return (
    <>
      <div className="adm-page" data-testid="page-messages">
        <PageHeading kicker="Engagement" title="Messages" lede="Triage enquiries sent through the contact form. Reply drafts are saved here; sending email from the workspace is not available yet." actions={<span className="adm-pill" data-testid="text-unread-count">{unread} unread</span>} />
        <Toolbar search={search} onSearch={setSearch} status={status} onStatus={setStatus} options={filters} searchLabel="Search messages" />
        {!list.loading && !list.error && <p className="adm-count" data-testid="text-result-count">{messages.length} of {total} messages{filtersActive ? ' matching' : ''}</p>}

        {!list.loading && !list.error && messages.length === 0 ? (
          <EmptyState title={filtersActive ? 'No messages match' : 'Inbox is empty'} text={filtersActive ? 'Try a different search or status.' : 'Messages sent through the contact form will appear here.'} onReset={filtersActive ? reset : undefined} />
        ) : messages.length > 0 && (
          <ul className="adm-list">
            {messages.map((m) => (
              <li key={m.id} className={`adm-message${m.status === 'NEW' ? ' is-unread' : ''}`} data-testid={`row-message-${m.id}`}>
                <button type="button" className="adm-message-main" onClick={() => open(m)} data-testid={`button-open-${m.id}`}>
                  <span className="adm-message-top"><strong>{m.name}</strong><small>{formatWhen(m.receivedAt)}</small></span>
                  <span className="adm-message-subject">{m.subject}</span>
                  <span className="adm-message-snippet">{m.body}</span>
                </button>
                <div className="adm-message-side">
                  <StatusBadge status={m.status} testId={`status-${m.id}`} />
                  <div className="adm-cell-actions">
                    <button type="button" className="adm-icon" aria-label={m.status === 'NEW' ? 'Mark as read' : 'Mark as unread'} title={m.status === 'NEW' ? 'Mark as read' : 'Mark as unread'} onClick={() => toggleRead(m)} data-testid={`button-toggle-read-${m.id}`}>{m.status === 'NEW' ? <MailOpen size={16} aria-hidden="true" /> : <MailCheck size={16} aria-hidden="true" />}</button>
                    <button type="button" className="adm-icon" aria-label="View message" title="View" onClick={() => open(m)} data-testid={`button-view-${m.id}`}><Eye size={16} aria-hidden="true" /></button>
                    <button type="button" className="adm-icon is-danger" aria-label="Delete message" title="Delete" onClick={() => setDeletingId(m.id)} data-testid={`button-delete-${m.id}`}><Trash2 size={16} aria-hidden="true" /></button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <ListStatus loading={list.loading} error={list.error} hasMore={list.hasMore} onRetry={list.reload} onLoadMore={list.loadMore} />
      </div>

      <DetailDialog
        open={!!viewing}
        onClose={() => setViewingId(null)}
        testId="dialog-message"
        title={viewing?.subject ?? 'Message'}
        description="Message details and reply draft"
        footer={viewing && (
          <>
            <button type="button" className="adm-btn is-small" onClick={() => toggleRead(viewing)} data-testid="button-details-toggle-read">{viewing.status === 'NEW' ? 'Mark as read' : 'Mark as unread'}</button>
            {viewing.status === 'ARCHIVED'
              ? <button type="button" className="adm-btn is-small" onClick={() => patchMessage(viewing, { status: 'READ' }, 'Restored from archive.')} data-testid="button-details-unarchive"><ArchiveRestore size={14} aria-hidden="true" /> Restore</button>
              : <button type="button" className="adm-btn is-small" onClick={() => patchMessage(viewing, { status: 'ARCHIVED' }, 'Message archived.')} data-testid="button-details-archive"><Archive size={14} aria-hidden="true" /> Archive</button>}
            <button type="button" className="adm-btn is-small is-danger" onClick={() => { setDeletingId(viewing.id); setViewingId(null); }} data-testid="button-details-delete">Delete</button>
          </>
        )}
      >
        {viewing && (
          <dl className="adm-detail">
            <div><dt>From</dt><dd data-testid="text-message-from">{viewing.name} &lt;<a href={`mailto:${viewing.email}`}>{viewing.email}</a>&gt;</dd></div>
            <div><dt>Received</dt><dd>{formatWhen(viewing.receivedAt)} <StatusBadge status={viewing.status} testId="status-message-details" /></dd></div>
            <div><dt>Message</dt><dd data-testid="text-message-body">{viewing.body}</dd></div>
            <div className="adm-reply">
              <label htmlFor="reply-draft">Reply draft</label>
              <textarea id="reply-draft" rows={5} value={draftText} onChange={(e) => setDraftText(e.target.value)} placeholder="Write a reply draft. It is saved to the workspace, not sent." data-testid="input-reply-draft" />
              <div className="adm-reply-actions">
                <small data-testid="text-reply-status">{viewing.replySavedAt ? `Draft saved ${formatWhen(viewing.replySavedAt)}. Not sent.` : 'No draft saved yet.'}</small>
                <button type="button" className="adm-btn is-small is-primary" disabled={savingDraft} onClick={async () => {
                  if (!draftText.trim()) { notify('Write something before saving a draft.', 'danger'); return; }
                  setSavingDraft(true);
                  await patchMessage(viewing, { replyDraft: draftText.trim() }, 'Reply draft saved.');
                  setSavingDraft(false);
                }} data-testid="button-save-reply">{savingDraft ? 'Saving…' : 'Save draft'}</button>
              </div>
            </div>
          </dl>
        )}
      </DetailDialog>

      <ConfirmDialog
        open={!!deletingId}
        title="Delete this message?"
        description="The message will be permanently deleted. This cannot be undone."
        onCancel={() => setDeletingId(null)}
        onConfirm={() => { if (deletingId) void remove(deletingId); setDeletingId(null); }}
      />
    </>
  );
}
