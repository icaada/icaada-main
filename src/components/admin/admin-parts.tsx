'use client';

import { type ReactNode } from 'react';
import { SearchX } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FieldsForm, type FieldConfig } from '@/components/admin/fields-form';

export function PageHeading({ kicker, title, lede, actions }: { kicker: string; title: string; lede: string; actions?: ReactNode }) {
  return (
    <div className="adm-heading">
      <div>
        <p className="admin-dashboard-kicker">{kicker}</p>
        <h1 data-testid={`heading-${title.toLowerCase()}`}>{title}</h1>
        <p className="admin-dashboard-lede">{lede}</p>
      </div>
      {actions && <div className="adm-heading-actions">{actions}</div>}
    </div>
  );
}

// API statuses are upper-case; badge CSS classes are the lower-case names.
// Inbox NEW renders as "Unread".
const statusStyles: Record<string, { className: string; label: string }> = {
  draft: { className: 'draft', label: 'Draft' },
  review: { className: 'review', label: 'In review' },
  published: { className: 'published', label: 'Published' },
  archived: { className: 'archived', label: 'Archived' },
  new: { className: 'unread', label: 'Unread' },
  unread: { className: 'unread', label: 'Unread' },
  read: { className: 'read', label: 'Read' },
  contacted: { className: 'read', label: 'Contacted' },
  subscribed: { className: 'subscribed', label: 'Subscribed' },
  unsubscribed: { className: 'unsubscribed', label: 'Unsubscribed' },
};
export function StatusBadge({ status, label, testId }: { status: string; label?: string; testId?: string }) {
  const style = statusStyles[status.toLowerCase()] ?? { className: status.toLowerCase(), label: status };
  return <span className={`adm-badge is-${style.className}`} data-testid={testId}>{label ?? style.label}</span>;
}

export function EmptyState({ title, text, onReset, resetLabel = 'Reset filters', action }: { title: string; text: string; onReset?: () => void; resetLabel?: string; action?: ReactNode }) {
  return (
    <div className="adm-empty" data-testid="state-empty">
      <SearchX size={26} aria-hidden="true" />
      <h3>{title}</h3>
      <p>{text}</p>
      <div className="adm-empty-actions">
        {onReset && <button type="button" className="adm-btn" onClick={onReset} data-testid="button-reset-filters">{resetLabel}</button>}
        {action}
      </div>
    </div>
  );
}

/** Loading / error / "load more" footer shared by the list screens. */
export function ListStatus({ loading, error, hasMore, onRetry, onLoadMore }: {
  loading: boolean; error: string | null; hasMore: boolean; onRetry: () => void; onLoadMore: () => void;
}) {
  if (error) {
    return (
      <p className="adm-form-error" role="alert" data-testid="text-list-error">
        {error} <button type="button" className="adm-btn is-small" onClick={onRetry} data-testid="button-retry">Retry</button>
      </p>
    );
  }
  if (loading) return <p className="adm-count" role="status" data-testid="text-loading">Loading…</p>;
  if (hasMore) {
    return (
      <div className="adm-load-more">
        <button type="button" className="adm-btn" onClick={onLoadMore} data-testid="button-load-more">Load more</button>
      </div>
    );
  }
  return null;
}

export function Toolbar({ search, onSearch, status, onStatus, options, searchLabel, extra }: {
  search: string; onSearch: (v: string) => void; status: string; onStatus: (v: string) => void;
  options: { value: string; label: string }[]; searchLabel: string; extra?: ReactNode;
}) {
  return (
    <div className="adm-toolbar">
      <label className="adm-search">
        <span className="sr-only">{searchLabel}</span>
        <input type="search" value={search} onChange={(e) => onSearch(e.target.value)} placeholder={searchLabel} data-testid="input-search" />
      </label>
      <div className="adm-chips" role="group" aria-label="Filter by status">
        {options.map((o) => (
          <button key={o.value} type="button" className={`adm-chip${status === o.value ? ' is-active' : ''}`} aria-pressed={status === o.value} onClick={() => onStatus(o.value)} data-testid={`filter-status-${o.value.toLowerCase()}`}>{o.label}</button>
        ))}
      </div>
      {extra}
    </div>
  );
}

export function ConfirmDialog({ open, title, description, confirmLabel = 'Delete', onConfirm, onCancel }: {
  open: boolean; title: string; description: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <AlertDialogContent className="adm-dialog" data-testid="dialog-confirm">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-confirm-cancel">Cancel</AlertDialogCancel>
          <AlertDialogAction className="adm-danger-action" onClick={onConfirm} data-testid="button-confirm-delete">{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function FormDialog({ open, title, description, fields, defaults, submitLabel, testPrefix, onSubmit, onClose }: {
  open: boolean; title: string; description: string; fields: FieldConfig[]; defaults: Record<string, string>;
  submitLabel: string; testPrefix: string; onSubmit: (v: Record<string, string>) => void | Promise<void>; onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="adm-dialog adm-dialog-wide" data-testid={`dialog-${testPrefix}`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <FieldsForm fields={fields} defaults={defaults} submitLabel={submitLabel} testPrefix={testPrefix} onSubmit={onSubmit} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  );
}

export function DetailDialog({ open, title, description, onClose, children, footer, testId }: {
  open: boolean; title: string; description: string; onClose: () => void; children: ReactNode; footer?: ReactNode; testId: string;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="adm-dialog adm-dialog-wide" data-testid={testId}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        {footer && <div className="adm-detail-footer">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
}
