'use client';

import { useEffect, useState } from 'react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ConfirmDialog, DetailDialog, EmptyState, FormDialog, ListStatus, PageHeading, StatusBadge, Toolbar } from '@/components/admin/admin-parts';
import { newRecordDefaults, statusFilterOptions, statusTransitions, type ModuleConfig } from '@/components/admin/module-configs';
import { adminApi, errorMessage } from '@/lib/admin/api-client';
import { useAdmin } from '@/lib/admin/admin-store';
import { displayValue, toFormValues, toPayload } from '@/lib/admin/field-values';
import { formatWhen } from '@/lib/admin/format';
import { useAdminList } from '@/lib/admin/use-admin-list';
import type { ContentStatus } from '@/Schemas/common.schema';

/** Any content-module DTO: common fields plus module-specific ones. */
type ContentRecord = {
  id: string;
  slug: string;
  status: ContentStatus;
  updatedAt: string;
  publishedAt: string | null;
} & Record<string, unknown>;

type Editing = ContentRecord | 'new' | null;

export function ModuleManager({ config }: { config: ModuleConfig }) {
  const { notify, refreshSummary } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  // Dashboard quick actions link here with ?new=1 to open the create dialog.
  const [editing, setEditing] = useState<Editing>(() => (searchParams.get('new') === '1' ? 'new' : null));
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ContentRecord | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [failedPreview, setFailedPreview] = useState('');

  const apiPath = `/admin/${config.key}`;
  const list = useAdminList<ContentRecord>(apiPath, { search, status: status === 'all' ? undefined : status });
  const items = list.items;
  const total = list.meta?.total ?? 0;
  const viewing = items.find((r) => r.id === viewingId) ?? null;

  // Drop ?new=1 from the URL so a refresh doesn't reopen the dialog.
  useEffect(() => {
    if (searchParams.get('new') === '1') router.replace(pathname);
  }, [searchParams, pathname, router]);

  const reset = () => { setSearch(''); setStatus('all'); };
  const filtersActive = search !== '' || status !== 'all';
  const title = (r: ContentRecord) => String(r[config.titleKey] ?? 'Untitled');
  const fieldFor = (key: string) => config.fields.find((f) => f.name === key);
  const cap = config.singular.charAt(0).toUpperCase() + config.singular.slice(1);

  const save = async (values: Record<string, string>) => {
    const payload = toPayload(config.fields, values);
    if (editing === 'new') {
      const { data } = await adminApi.post<ContentRecord>(apiPath, payload);
      notify(`Created ${config.singular} “${title(data)}” as a draft.`);
      list.reload();
    } else if (editing) {
      const { data } = await adminApi.patch<ContentRecord>(`${apiPath}/${editing.id}`, payload);
      list.replaceItem(data);
      notify(`Saved “${title(data)}”.`);
    }
    setEditing(null);
    void refreshSummary();
  };

  const changeStatus = async (r: ContentRecord, to: ContentStatus, label: string) => {
    setBusyId(r.id);
    try {
      const { data } = await adminApi.post<ContentRecord>(`${apiPath}/${r.id}/status`, { status: to });
      // Drop it from a filtered view it no longer matches.
      if (status !== 'all' && data.status !== status) list.removeItem(data.id);
      else list.replaceItem(data);
      notify(`${label}: “${title(data)}”.`);
      void refreshSummary();
    } catch (error) {
      notify(errorMessage(error), 'danger');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (r: ContentRecord) => {
    try {
      await adminApi.del(`${apiPath}/${r.id}`);
      list.removeItem(r.id);
      notify(`Deleted “${title(r)}”.`);
      void refreshSummary();
    } catch (error) {
      notify(errorMessage(error), 'danger');
    }
  };

  const transitionButtons = (r: ContentRecord, all: boolean) => {
    const options = statusTransitions[r.status];
    return (all ? options : options.slice(0, 1)).map((t) => (
      <button key={t.to} type="button" disabled={busyId === r.id} className={`adm-btn is-small${t.to === 'PUBLISHED' ? ' is-primary' : ''}`} onClick={() => changeStatus(r, t.to, t.label)} data-testid={`button-${t.to.toLowerCase()}-${r.id}`}>{t.label}</button>
    ));
  };

  const preview = viewing && config.previewKey ? (viewing[config.previewKey] as string | null) : null;

  return (
    <>
      <div className="adm-page" data-testid={`page-${config.key}`}>
        <PageHeading
          kicker={config.kicker}
          title={config.label}
          lede={config.lede}
          actions={<button type="button" className="adm-btn is-primary" onClick={() => setEditing('new')} data-testid={`button-add-${config.key}`}><Plus size={16} aria-hidden="true" /> Add {config.singular}</button>}
        />
        <Toolbar search={search} onSearch={setSearch} status={status} onStatus={setStatus} options={statusFilterOptions} searchLabel={`Search ${config.label.toLowerCase()}`} />
        {!list.loading && !list.error && <p className="adm-count" data-testid="text-result-count">{items.length} of {total} {total === 1 ? 'record' : 'records'}{filtersActive ? ' matching' : ''}</p>}

        {!list.loading && !list.error && items.length === 0 ? (
          !filtersActive ? (
            <EmptyState title={`No ${config.label.toLowerCase()} yet`} text={`Add the first ${config.singular} to start a draft.`} action={<button type="button" className="adm-btn is-primary" onClick={() => setEditing('new')} data-testid="button-add-empty">Add {config.singular}</button>} />
          ) : (
            <EmptyState title="Nothing matches" text="No records fit the current search and status filter." onReset={reset} />
          )
        ) : items.length > 0 && (
          <div className="adm-table" role="table" aria-label={config.label}>
            <div className="adm-row is-head" role="row">
              <span role="columnheader">{config.fields[0].label}</span>
              {config.columns.map((c) => <span role="columnheader" key={c.key}>{c.label}</span>)}
              <span role="columnheader">Status</span>
              <span role="columnheader">Actions</span>
            </div>
            {items.map((r) => (
              <div className="adm-row" role="row" key={r.id} data-testid={`row-${config.key}-${r.id}`}>
                <span role="cell" className="adm-cell-title"><strong data-testid={`text-title-${r.id}`}>{title(r)}</strong><small>Updated {formatWhen(r.updatedAt)}</small></span>
                {config.columns.map((c) => <span role="cell" className="adm-cell-clip" data-label={c.label} key={c.key}>{displayValue(fieldFor(c.key), r[c.key]) || '—'}</span>)}
                <span role="cell" data-label="Status"><StatusBadge status={r.status} testId={`status-${r.id}`} /></span>
                <span role="cell" className="adm-cell-actions">
                  {transitionButtons(r, false)}
                  <button type="button" className="adm-icon" onClick={() => setViewingId(r.id)} aria-label={`View ${title(r)}`} title="View details" data-testid={`button-view-${r.id}`}><Eye size={16} aria-hidden="true" /></button>
                  <button type="button" className="adm-icon" onClick={() => setEditing(r)} aria-label={`Edit ${title(r)}`} title="Edit" data-testid={`button-edit-${r.id}`}><Pencil size={16} aria-hidden="true" /></button>
                  <button type="button" className="adm-icon is-danger" onClick={() => setDeleting(r)} aria-label={`Delete ${title(r)}`} title="Delete" data-testid={`button-delete-${r.id}`}><Trash2 size={16} aria-hidden="true" /></button>
                </span>
              </div>
            ))}
          </div>
        )}
        <ListStatus loading={list.loading} error={list.error} hasMore={list.hasMore} onRetry={list.reload} onLoadMore={list.loadMore} />
      </div>

      {editing && (
        <FormDialog
          open
          title={editing === 'new' ? `Add ${config.singular}` : `Edit ${config.singular}`}
          description={editing === 'new' ? 'New records start as drafts. Cancel discards everything you typed.' : 'Changes apply only when you save. Cancel keeps the record as it was.'}
          fields={config.fields}
          defaults={editing === 'new' ? newRecordDefaults[config.key] ?? {} : toFormValues(config.fields, editing)}
          submitLabel={editing === 'new' ? `Create ${config.singular}` : 'Save changes'}
          testPrefix={`${config.key}-editor`}
          onClose={() => setEditing(null)}
          onSubmit={save}
        />
      )}

      <DetailDialog
        open={!!viewing}
        onClose={() => setViewingId(null)}
        testId="dialog-details"
        title={viewing ? title(viewing) : cap}
        description={`${cap} details`}
        footer={viewing && (
          <>
            {transitionButtons(viewing, true)}
            <button type="button" className="adm-btn is-small" onClick={() => { setEditing(viewing); setViewingId(null); }} data-testid="button-details-edit">Edit</button>
            <button type="button" className="adm-btn is-small is-danger" onClick={() => { setDeleting(viewing); setViewingId(null); }} data-testid="button-details-delete">Delete</button>
          </>
        )}
      >
        {viewing && (
          <dl className="adm-detail" data-testid="details-body">
            <div><dt>Status</dt><dd><StatusBadge status={viewing.status} testId="status-details" /></dd></div>
            <div><dt>Slug</dt><dd data-testid="details-slug">{viewing.slug}</dd></div>
            {config.fields.map((f) => (
              <div key={f.name}>
                <dt>{f.label}</dt>
                <dd data-testid={`details-${f.name}`}>{displayValue(f, viewing[f.name]) || 'Not provided'}</dd>
              </div>
            ))}
            {preview && (
              <div><dt>Preview</dt><dd>{failedPreview === preview ? <p>Image preview unavailable.</p> : (
                // eslint-disable-next-line @next/next/no-img-element -- admin preview of an editor-supplied URL
                <img className="adm-asset-preview" style={{ display: 'block' }} src={preview} alt={String(viewing.altText ?? '')} onError={() => setFailedPreview(preview)} data-testid="img-details-preview" />
              )}</dd></div>
            )}
            <div><dt>Published</dt><dd>{viewing.publishedAt ? formatWhen(viewing.publishedAt) : 'Never'}</dd></div>
            <div><dt>Last updated</dt><dd>{formatWhen(viewing.updatedAt)}</dd></div>
          </dl>
        )}
      </DetailDialog>

      <ConfirmDialog
        open={!!deleting}
        title={`Delete this ${config.singular}?`}
        description={deleting ? `"${title(deleting)}" will be permanently deleted${deleting.status === 'PUBLISHED' ? ' and removed from the public site' : ''}. This cannot be undone.` : ''}
        onCancel={() => setDeleting(null)}
        onConfirm={() => { if (deleting) void remove(deleting); setDeleting(null); }}
      />
    </>
  );
}
