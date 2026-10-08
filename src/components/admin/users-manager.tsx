'use client';

import { useState } from 'react';
import { KeyRound, LogOut, Pencil, Plus, Trash2 } from 'lucide-react';
import { ConfirmDialog, EmptyState, FormDialog, ListStatus, PageHeading, StatusBadge, Toolbar } from '@/components/admin/admin-parts';
import type { FieldConfig } from '@/components/admin/fields-form';
import { adminApi, errorMessage } from '@/lib/admin/api-client';
import { useAdmin } from '@/lib/admin/admin-store';
import { formatWhen } from '@/lib/admin/format';
import { useAdminList } from '@/lib/admin/use-admin-list';
import type { UserDto } from '@/Services/user.service';

const roleOptions = [{ value: 'EDITOR', label: 'Editor' }, { value: 'ADMIN', label: 'Administrator' }];
const statusOptions = [{ value: 'ACTIVE', label: 'Active' }, { value: 'DISABLED', label: 'Disabled' }];
const createFields: FieldConfig[] = [
  { name: 'name', label: 'Name', kind: 'text', required: true, maxLength: 120 },
  { name: 'email', label: 'Email', kind: 'email', required: true, help: 'They will receive an email invite to choose their own password.' },
  { name: 'role', label: 'Role', kind: 'select', required: true, options: roleOptions, help: 'Editors manage content, inbox and newsletter. Administrators can also manage users and workspace settings.' },
  { name: 'roleTitle', label: 'Job title', kind: 'text', maxLength: 120, placeholder: 'e.g. Communications officer' },
];
const editFields: FieldConfig[] = [
  { name: 'name', label: 'Name', kind: 'text', required: true, maxLength: 120 },
  { name: 'role', label: 'Role', kind: 'select', required: true, options: roleOptions },
  { name: 'status', label: 'Status', kind: 'select', required: true, options: statusOptions, help: 'Disabling signs them out everywhere and blocks sign-in.' },
  { name: 'roleTitle', label: 'Job title', kind: 'text', maxLength: 120 },
];
// You can't change your own role or status (the API enforces this too).
const selfEditFields = editFields.filter((f) => f.name !== 'role' && f.name !== 'status');
const filters = [{ value: 'all', label: 'All' }, ...statusOptions];

type Pending = { user: UserDto; action: 'delete' | 'revoke' } | null;

export function UsersManager({ currentUserId }: { currentUserId: string }) {
  const { notify } = useAdmin();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [editing, setEditing] = useState<UserDto | 'new' | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const list = useAdminList<UserDto>('/admin/users', { search, status: status === 'all' ? undefined : status });
  const users = list.items;
  const filtersActive = search !== '' || status !== 'all';

  const save = async (values: Record<string, string>) => {
    if (editing === 'new') {
      await adminApi.post('/admin/users', { name: values.name, email: values.email, role: values.role, roleTitle: values.roleTitle || null });
      notify(`Invite sent to ${values.email}.`);
      list.reload();
    } else if (editing) {
      const self = editing.id === currentUserId;
      const { data } = await adminApi.patch<UserDto>(`/admin/users/${editing.id}`, {
        name: values.name,
        roleTitle: values.roleTitle || null,
        ...(self ? {} : { role: values.role, status: values.status }),
      });
      list.replaceItem(data);
      notify(`Saved ${data.name}.`);
    }
    setEditing(null);
  };

  const run = async (user: UserDto, action: () => Promise<string>) => {
    setBusyId(user.id);
    try {
      notify(await action());
    } catch (error) {
      notify(errorMessage(error), 'danger');
    } finally {
      setBusyId(null);
    }
  };

  const sendLink = (user: UserDto) => run(user, async () => {
    const { data } = await adminApi.post<{ purpose: 'INVITE' | 'RESET' }>(`/admin/users/${user.id}/password-link`);
    return data.purpose === 'INVITE' ? `Invite re-sent to ${user.email}.` : `Password reset link sent to ${user.email}.`;
  });

  const confirmPending = () => {
    if (!pending) return;
    const { user, action } = pending;
    setPending(null);
    void run(user, async () => {
      if (action === 'delete') {
        await adminApi.del(`/admin/users/${user.id}`);
        list.removeItem(user.id);
        return `Deleted ${user.name}.`;
      }
      const { data } = await adminApi.del<{ revoked: number }>(`/admin/users/${user.id}/sessions`);
      return `Signed ${user.name} out of ${data.revoked} session${data.revoked === 1 ? '' : 's'}.`;
    });
  };

  return (
    <>
      <div className="adm-page" data-testid="page-users">
        <PageHeading
          kicker="Settings"
          title="Users"
          lede="Invite people to the workspace, set their role, and manage access. New users choose their own password from an email invite."
          actions={<button type="button" className="adm-btn is-primary" onClick={() => setEditing('new')} data-testid="button-add-user"><Plus size={16} aria-hidden="true" /> Invite user</button>}
        />
        <Toolbar search={search} onSearch={setSearch} status={status} onStatus={setStatus} options={filters} searchLabel="Search by name or email" />
        {!list.loading && !list.error && <p className="adm-count" data-testid="text-result-count">{users.length} of {list.meta?.total ?? 0} users{filtersActive ? ' matching' : ''}</p>}

        {!list.loading && !list.error && users.length === 0 ? (
          <EmptyState title="No users match" text="Try a different search or status." onReset={filtersActive ? () => { setSearch(''); setStatus('all'); } : undefined} />
        ) : users.length > 0 && (
          <div className="adm-table" role="table" aria-label="Users">
            <div className="adm-row is-head" role="row">
              <span role="columnheader">Name</span>
              <span role="columnheader">Role</span>
              <span role="columnheader">Last sign-in</span>
              <span role="columnheader">Status</span>
              <span role="columnheader">Actions</span>
            </div>
            {users.map((u) => {
              const self = u.id === currentUserId;
              const busy = busyId === u.id;
              return (
                <div className="adm-row" role="row" key={u.id} data-testid={`row-user-${u.id}`}>
                  <span role="cell" className="adm-cell-title"><strong>{u.name}{self ? ' (you)' : ''}</strong><small>{u.email}</small></span>
                  <span role="cell" className="adm-cell-clip" data-label="Role">{u.role === 'ADMIN' ? 'Administrator' : 'Editor'}{u.roleTitle ? ` · ${u.roleTitle}` : ''}</span>
                  <span role="cell" className="adm-cell-clip" data-label="Last sign-in">{u.lastLoginAt ? formatWhen(u.lastLoginAt) : 'Invite pending'}</span>
                  <span role="cell" data-label="Status"><StatusBadge status={u.status} testId={`status-${u.id}`} /></span>
                  <span role="cell" className="adm-cell-actions">
                    <button type="button" className="adm-icon" disabled={busy || u.status !== 'ACTIVE'} onClick={() => sendLink(u)} aria-label={u.lastLoginAt ? `Send ${u.name} a password reset link` : `Re-send invite to ${u.name}`} title={u.lastLoginAt ? 'Send password reset link' : 'Re-send invite'} data-testid={`button-password-link-${u.id}`}><KeyRound size={16} aria-hidden="true" /></button>
                    <button type="button" className="adm-icon" disabled={busy} onClick={() => setPending({ user: u, action: 'revoke' })} aria-label={`Sign ${u.name} out everywhere`} title="Sign out everywhere" data-testid={`button-revoke-${u.id}`}><LogOut size={16} aria-hidden="true" /></button>
                    <button type="button" className="adm-icon" disabled={busy} onClick={() => setEditing(u)} aria-label={`Edit ${u.name}`} title="Edit" data-testid={`button-edit-${u.id}`}><Pencil size={16} aria-hidden="true" /></button>
                    {!self && <button type="button" className="adm-icon is-danger" disabled={busy} onClick={() => setPending({ user: u, action: 'delete' })} aria-label={`Delete ${u.name}`} title="Delete" data-testid={`button-delete-${u.id}`}><Trash2 size={16} aria-hidden="true" /></button>}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <ListStatus loading={list.loading} error={list.error} hasMore={list.hasMore} onRetry={list.reload} onLoadMore={list.loadMore} />
      </div>

      {editing && (
        <FormDialog
          open
          title={editing === 'new' ? 'Invite a user' : `Edit ${editing.name}`}
          description={editing === 'new' ? 'They will get an email with a link to set their password. The link lasts 3 days.' : editing.id === currentUserId ? 'You can change your name and title here. Another administrator must change your role or status.' : editing.email}
          fields={editing === 'new' ? createFields : editing.id === currentUserId ? selfEditFields : editFields}
          defaults={editing === 'new' ? { role: 'EDITOR' } : { name: editing.name, role: editing.role, status: editing.status, roleTitle: editing.roleTitle ?? '' }}
          submitLabel={editing === 'new' ? 'Send invite' : 'Save changes'}
          testPrefix="user"
          onClose={() => setEditing(null)}
          onSubmit={save}
        />
      )}

      <ConfirmDialog
        open={!!pending}
        title={pending?.action === 'delete' ? `Delete ${pending.user.name}?` : `Sign ${pending?.user.name} out everywhere?`}
        description={pending?.action === 'delete'
          ? 'Their account and sessions are removed permanently. Content they created stays; activity entries keep no link to them.'
          : 'Every browser where they are signed in will need to sign in again.'}
        confirmLabel={pending?.action === 'delete' ? 'Delete' : 'Sign out'}
        onCancel={() => setPending(null)}
        onConfirm={confirmPending}
      />
    </>
  );
}
