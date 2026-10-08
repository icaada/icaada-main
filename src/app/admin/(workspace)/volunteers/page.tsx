'use client';

import { useState } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { ConfirmDialog, DetailDialog, EmptyState, ListStatus, PageHeading, StatusBadge, Toolbar } from '@/components/admin/admin-parts';
import { adminApi, errorMessage } from '@/lib/admin/api-client';
import { useAdmin } from '@/lib/admin/admin-store';
import { formatWhen } from '@/lib/admin/format';
import { useAdminList } from '@/lib/admin/use-admin-list';
import type { VolunteerStatus } from '@/Schemas/volunteer.schema';
import type { VolunteerDto } from '@/Services/volunteer.service';

const filters = [
  { value: 'all', label: 'All' },
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'ARCHIVED', label: 'Archived' },
];
const badgeLabel = (status: VolunteerStatus) => (status === 'NEW' ? 'New' : undefined);

export default function AdminVolunteers() {
  const { notify, refreshSummary } = useAdmin();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const list = useAdminList<VolunteerDto>('/admin/volunteers', { search, status: status === 'all' ? undefined : status });
  const applications = list.items;
  const total = list.meta?.total ?? 0;
  const filtersActive = search !== '' || status !== 'all';
  const viewing = applications.find((a) => a.id === viewingId) ?? null;
  const reset = () => { setSearch(''); setStatus('all'); };

  const setApplicationStatus = async (a: VolunteerDto, next: VolunteerStatus, success: string) => {
    try {
      const { data } = await adminApi.patch<VolunteerDto>(`/admin/volunteers/${a.id}`, { status: next });
      if (status !== 'all' && data.status !== status) list.removeItem(data.id);
      else list.replaceItem(data);
      notify(success);
      void refreshSummary();
    } catch (error) {
      notify(errorMessage(error), 'danger');
    }
  };

  const remove = async (id: string) => {
    try {
      await adminApi.del(`/admin/volunteers/${id}`);
      list.removeItem(id);
      notify('Application deleted.');
      void refreshSummary();
    } catch (error) {
      notify(errorMessage(error), 'danger');
    }
  };

  return (
    <>
      <div className="adm-page" data-testid="page-volunteers">
        <PageHeading kicker="Engagement" title="Volunteers" lede="Applications sent through the volunteer form on the website. Mark people as contacted once someone has reached out." />
        <Toolbar search={search} onSearch={setSearch} status={status} onStatus={setStatus} options={filters} searchLabel="Search by name, email, state or LGA" />
        {!list.loading && !list.error && <p className="adm-count" data-testid="text-result-count">{applications.length} of {total} applications{filtersActive ? ' matching' : ''}</p>}

        {!list.loading && !list.error && applications.length === 0 ? (
          <EmptyState title={filtersActive ? 'No applications match' : 'No applications yet'} text={filtersActive ? 'Try a different search or status.' : 'Volunteer applications from the website will appear here.'} onReset={filtersActive ? reset : undefined} />
        ) : applications.length > 0 && (
          <ul className="adm-list">
            {applications.map((a) => (
              <li key={a.id} className={`adm-message${a.status === 'NEW' ? ' is-unread' : ''}`} data-testid={`row-volunteer-${a.id}`}>
                <button type="button" className="adm-message-main" onClick={() => setViewingId(a.id)} data-testid={`button-open-${a.id}`}>
                  <span className="adm-message-top"><strong>{a.name}</strong><small>{formatWhen(a.createdAt)}</small></span>
                  <span className="adm-message-subject">{[a.lga, a.state].filter(Boolean).join(', ')} · {a.interests.join(', ')}</span>
                  <span className="adm-message-snippet">{a.message || a.availability || a.email}</span>
                </button>
                <div className="adm-message-side">
                  <StatusBadge status={a.status} label={badgeLabel(a.status)} testId={`status-${a.id}`} />
                  <div className="adm-cell-actions">
                    {a.status === 'NEW' && <button type="button" className="adm-btn is-small" onClick={() => setApplicationStatus(a, 'CONTACTED', `Marked ${a.name} as contacted.`)} data-testid={`button-contacted-${a.id}`}>Mark contacted</button>}
                    <button type="button" className="adm-icon" aria-label="View application" title="View" onClick={() => setViewingId(a.id)} data-testid={`button-view-${a.id}`}><Eye size={16} aria-hidden="true" /></button>
                    <button type="button" className="adm-icon is-danger" aria-label="Delete application" title="Delete" onClick={() => setDeletingId(a.id)} data-testid={`button-delete-${a.id}`}><Trash2 size={16} aria-hidden="true" /></button>
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
        testId="dialog-volunteer"
        title={viewing?.name ?? 'Application'}
        description="Volunteer application"
        footer={viewing && (
          <>
            {viewing.status !== 'CONTACTED' && <button type="button" className="adm-btn is-small is-primary" onClick={() => setApplicationStatus(viewing, 'CONTACTED', `Marked ${viewing.name} as contacted.`)} data-testid="button-details-contacted">Mark contacted</button>}
            {viewing.status !== 'ARCHIVED'
              ? <button type="button" className="adm-btn is-small" onClick={() => setApplicationStatus(viewing, 'ARCHIVED', 'Application archived.')} data-testid="button-details-archive">Archive</button>
              : <button type="button" className="adm-btn is-small" onClick={() => setApplicationStatus(viewing, 'NEW', 'Application restored.')} data-testid="button-details-restore">Restore</button>}
            <button type="button" className="adm-btn is-small is-danger" onClick={() => { setDeletingId(viewing.id); setViewingId(null); }} data-testid="button-details-delete">Delete</button>
          </>
        )}
      >
        {viewing && (
          <dl className="adm-detail" data-testid="details-volunteer">
            <div><dt>Status</dt><dd><StatusBadge status={viewing.status} label={badgeLabel(viewing.status)} /></dd></div>
            <div><dt>Email</dt><dd><a href={`mailto:${viewing.email}`}>{viewing.email}</a></dd></div>
            <div><dt>Phone</dt><dd>{viewing.phone ? <a href={`tel:${viewing.phone.replace(/\s+/g, '')}`}>{viewing.phone}</a> : 'Not provided'}</dd></div>
            <div><dt>Location</dt><dd>{[viewing.lga, viewing.state].filter(Boolean).join(', ')}</dd></div>
            <div><dt>Interests</dt><dd>{viewing.interests.join(', ')}</dd></div>
            <div><dt>Availability</dt><dd>{viewing.availability || 'Not provided'}</dd></div>
            <div><dt>Message</dt><dd>{viewing.message || 'Not provided'}</dd></div>
            <div><dt>Received</dt><dd>{formatWhen(viewing.createdAt)}</dd></div>
          </dl>
        )}
      </DetailDialog>

      <ConfirmDialog
        open={!!deletingId}
        title="Delete this application?"
        description="The application and the applicant's contact details will be permanently deleted."
        onCancel={() => setDeletingId(null)}
        onConfirm={() => { if (deletingId) void remove(deletingId); setDeletingId(null); }}
      />
    </>
  );
}
