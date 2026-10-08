'use client';

import { useState } from 'react';
import { PageHeading } from '@/components/admin/admin-parts';
import { FieldsForm, type FieldConfig } from '@/components/admin/fields-form';
import { adminApi } from '@/lib/admin/api-client';
import { useAdmin } from '@/lib/admin/admin-store';
import type { WorkspaceSettingsDto } from '@/Services/settings.service';
import type { UserDto } from '@/Services/user.service';

const TIMEZONES = ['Africa/Lagos', 'UTC', 'Africa/Nairobi', 'Africa/Johannesburg', 'Europe/London'];

const workspaceFields = (currentTimezone: string): FieldConfig[] => [
  { name: 'workspaceName', label: 'Workspace name', kind: 'text', required: true, maxLength: 120 },
  { name: 'contactEmail', label: 'Workspace contact email', kind: 'email', required: true },
  // Keep whatever zone is stored selectable even if it is not in the short list.
  { name: 'timezone', label: 'Time zone', kind: 'select', required: true, options: TIMEZONES.includes(currentTimezone) ? TIMEZONES : [currentTimezone, ...TIMEZONES] },
  { name: 'language', label: 'Default language', kind: 'select', required: true, options: ['English', 'French', 'Portuguese', 'Arabic', 'Hausa'] },
];
const profileFields: FieldConfig[] = [
  { name: 'name', label: 'Display name', kind: 'text', required: true, maxLength: 120 },
  { name: 'roleTitle', label: 'Role title', kind: 'text', maxLength: 120 },
  { name: 'digest', label: 'Activity digest', kind: 'select', required: true, options: ['Daily', 'Weekly', 'Never'] },
  { name: 'density', label: 'Interface density', kind: 'select', required: true, options: ['Comfortable', 'Compact'] },
  { name: 'messageAlerts', label: 'Message alerts in the header', kind: 'select', required: true, options: ['On', 'Off'] },
];
const passwordFields: FieldConfig[] = [
  { name: 'currentPassword', label: 'Current password', kind: 'password', required: true },
  { name: 'newPassword', label: 'New password', kind: 'password', required: true, help: 'At least 12 characters, with a letter and a number.' },
];

export default function AdminSettings() {
  const { me, setMe, workspace, setWorkspace, notify } = useAdmin();
  const [wsKey, setWsKey] = useState(0);
  const [pfKey, setPfKey] = useState(0);
  const [pwKey, setPwKey] = useState(0);
  const isAdmin = me.role === 'ADMIN';

  return (
    <div className="adm-page" data-testid="page-settings">
      <PageHeading kicker="Settings" title="Settings" lede={isAdmin ? 'Workspace settings apply to everyone. Profile settings apply only to you.' : 'Profile settings apply only to you. Workspace settings are managed by administrators.'} />
      <div className="adm-settings-grid">
        <section className="adm-card" aria-labelledby="ws-title">
          <h2 id="ws-title">Workspace</h2>
          {isAdmin ? (
            <>
              <p>Shown across the admin workspace.</p>
              <FieldsForm key={`ws-${wsKey}`} fields={workspaceFields(workspace.timezone)} defaults={{ workspaceName: workspace.workspaceName, contactEmail: workspace.contactEmail, timezone: workspace.timezone, language: workspace.language }} testPrefix="workspace" submitLabel="Save workspace" cancelLabel="Discard changes"
                onCancel={() => { setWsKey((k) => k + 1); notify('Workspace changes discarded.', 'info'); }}
                onSubmit={async (v) => {
                  const { data } = await adminApi.patch<WorkspaceSettingsDto>('/admin/settings', v);
                  setWorkspace(data);
                  setWsKey((k) => k + 1);
                  notify('Workspace settings saved.');
                }} />
            </>
          ) : (
            <dl className="adm-detail" data-testid="workspace-readonly">
              <div><dt>Workspace name</dt><dd>{workspace.workspaceName}</dd></div>
              <div><dt>Contact email</dt><dd>{workspace.contactEmail}</dd></div>
              <div><dt>Time zone</dt><dd>{workspace.timezone}</dd></div>
              <div><dt>Default language</dt><dd>{workspace.language}</dd></div>
            </dl>
          )}
        </section>
        <section className="adm-card" aria-labelledby="pf-title">
          <h2 id="pf-title">Profile and preferences</h2>
          <p>Signed in as {me.email}. Display name, role title and density update the header and layout after saving.</p>
          <FieldsForm key={`pf-${pfKey}`} fields={profileFields} defaults={{ name: me.name, roleTitle: me.roleTitle ?? '', ...me.preferences }} testPrefix="profile" submitLabel="Save preferences" cancelLabel="Discard changes"
            onCancel={() => { setPfKey((k) => k + 1); notify('Profile changes discarded.', 'info'); }}
            onSubmit={async (v) => {
              const { data } = await adminApi.patch<UserDto>('/admin/profile', {
                name: v.name,
                roleTitle: v.roleTitle || null,
                preferences: { digest: v.digest, density: v.density, messageAlerts: v.messageAlerts },
              });
              setMe(data);
              setPfKey((k) => k + 1);
              notify('Profile saved.');
            }} />
        </section>
        <section className="adm-card" aria-labelledby="pw-title">
          <h2 id="pw-title">Password</h2>
          <p>Change the password you use to sign in.</p>
          <FieldsForm key={`pw-${pwKey}`} fields={passwordFields} defaults={{}} testPrefix="password" submitLabel="Change password" cancelLabel="Clear"
            onCancel={() => setPwKey((k) => k + 1)}
            onSubmit={async (v) => {
              await adminApi.post('/admin/profile/password', v);
              setPwKey((k) => k + 1);
              notify('Password changed.');
            }} />
        </section>
      </div>
    </div>
  );
}
