import { useEffect, useMemo, useState } from 'react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useLocation, useSearch } from 'wouter';
import { AdminLayout } from '@/components/admin/admin-layout';
import { ConfirmDialog, DemoNotice, DetailDialog, EmptyState, FormDialog, PageHeading, StatusBadge, Toolbar } from '@/components/admin/admin-parts';
import { statusFilterOptions, statusTransitions, type ModuleConfig } from '@/components/admin/module-configs';
import { formatWhen, useDemo } from '@/lib/admin/demo-store';
import type { ModuleRecord } from '@/data/admin/mock';

type Editing = ModuleRecord | 'new' | null;

export function ModuleManager({ config }: { config: ModuleConfig }) {
  const { records, addRecord, updateRecord, removeRecord, setRecordStatus } = useDemo();
  const [location, setLocation] = useLocation();
  const searchParams = useSearch();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [editing, setEditing] = useState<Editing>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ModuleRecord | null>(null);
  const [failedPreview, setFailedPreview] = useState('');

  const items = records[config.key];
  const viewing = items.find((r) => r.id === viewingId) ?? null;

  useEffect(() => {
    if (new URLSearchParams(searchParams).get('new') === '1') {
      setEditing('new');
      setLocation(location, { replace: true });
    }
  }, [searchParams, location, setLocation]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((r) => {
      if (status !== 'all' && r.status !== status) return false;
      if (!q) return true;
      return config.fields.some((f) => (r[f.name] ?? '').toLowerCase().includes(q));
    });
  }, [items, search, status, config.fields]);

  const reset = () => { setSearch(''); setStatus('all'); };
  const filtersActive = search !== '' || status !== 'all';
  const title = (r: ModuleRecord) => r[config.titleKey];
  const cap = config.singular.charAt(0).toUpperCase() + config.singular.slice(1);

  const transitionButtons = (r: ModuleRecord, all: boolean) => {
    const list = statusTransitions[r.status];
    return (all ? list : list.slice(0, 1)).map((t) => (
      <button key={t.to} type="button" className={`adm-btn is-small${t.to === 'published' ? ' is-primary' : ''}`} onClick={() => setRecordStatus(config.key, config.titleKey, r.id, t.to, t.label)} data-testid={`button-${t.to}-${r.id}`}>{t.label}</button>
    ));
  };

  return (
    <AdminLayout>
      <div className="adm-page" data-testid={`page-${config.key}`}>
        <PageHeading
          kicker={config.kicker}
          title={config.label}
          lede={config.lede}
          actions={<button type="button" className="adm-btn is-primary" onClick={() => setEditing('new')} data-testid={`button-add-${config.key}`}><Plus size={16} aria-hidden="true" /> Add {config.singular}</button>}
        />
        <DemoNotice />
        <Toolbar search={search} onSearch={setSearch} status={status} onStatus={setStatus} options={statusFilterOptions} searchLabel={`Search ${config.label.toLowerCase()}`} />
        <p className="adm-count" data-testid="text-result-count">{filtered.length} of {items.length} {items.length === 1 ? 'record' : 'records'}</p>

        {filtered.length === 0 ? (
          items.length === 0 ? (
            <EmptyState title={`No ${config.label.toLowerCase()} yet`} text={`Add the first ${config.singular} to start a draft.`} action={<button type="button" className="adm-btn is-primary" onClick={() => setEditing('new')} data-testid="button-add-empty">Add {config.singular}</button>} />
          ) : (
            <EmptyState title="Nothing matches" text="No records fit the current search and status filter." onReset={filtersActive ? reset : undefined} />
          )
        ) : (
          <div className="adm-table" role="table" aria-label={config.label}>
            <div className="adm-row is-head" role="row">
              <span role="columnheader">{config.fields[0].label}</span>
              {config.columns.map((c) => <span role="columnheader" key={c.key}>{c.label}</span>)}
              <span role="columnheader">Status</span>
              <span role="columnheader">Actions</span>
            </div>
            {filtered.map((r) => (
              <div className="adm-row" role="row" key={r.id} data-testid={`row-${config.key}-${r.id}`}>
                <span role="cell" className="adm-cell-title"><strong data-testid={`text-title-${r.id}`}>{title(r)}</strong><small>Updated {formatWhen(r.updatedAt)}</small></span>
                {config.columns.map((c) => <span role="cell" className="adm-cell-clip" data-label={c.label} key={c.key}>{r[c.key] || '—'}</span>)}
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
      </div>

      {editing && (
        <FormDialog
          open
          title={editing === 'new' ? `Add ${config.singular}` : `Edit ${config.singular}`}
          description={editing === 'new' ? 'New records start as drafts. Cancel discards everything you typed.' : 'Changes apply only when you save. Cancel keeps the record as it was.'}
          fields={config.fields}
          defaults={editing === 'new' ? {} : editing}
          submitLabel={editing === 'new' ? `Create ${config.singular}` : 'Save changes'}
          testPrefix={`${config.key}-editor`}
          onClose={() => setEditing(null)}
          onSubmit={(values) => {
            if (editing === 'new') addRecord(config.key, config.titleKey, values);
            else updateRecord(config.key, config.titleKey, editing.id, values);
            setEditing(null);
          }}
        />
      )}

      <DetailDialog
        open={!!viewing}
        onClose={() => setViewingId(null)}
        testId="dialog-details"
        title={viewing ? title(viewing) : cap}
        description={`${cap} details preview`}
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
            {config.fields.map((f) => (
              <div key={f.name}>
                <dt>{f.label}</dt>
                <dd data-testid={`details-${f.name}`}>{viewing[f.name] || 'Not provided'}</dd>
              </div>
            ))}
            {config.key === 'media' && viewing.type === 'Image' && viewing.assetUrl && (
              <div><dt>Preview</dt><dd>{failedPreview === viewing.assetUrl ? <p>Image preview unavailable. The demo URL may not point to an actual file.</p> : <img className="adm-asset-preview" style={{ display: 'block' }} src={viewing.assetUrl} alt={viewing.altText} onError={() => setFailedPreview(viewing.assetUrl)} data-testid="img-details-preview" />}</dd></div>
            )}
            <div><dt>Last updated</dt><dd>{formatWhen(viewing.updatedAt)}</dd></div>
          </dl>
        )}
      </DetailDialog>

      <ConfirmDialog
        open={!!deleting}
        title={`Delete this ${config.singular}?`}
        description={deleting ? `"${title(deleting)}" will be removed from this demo session. This cannot be undone until you refresh the page.` : ''}
        onCancel={() => setDeleting(null)}
        onConfirm={() => { if (deleting) removeRecord(config.key, config.titleKey, deleting.id); setDeleting(null); }}
      />
    </AdminLayout>
  );
}
