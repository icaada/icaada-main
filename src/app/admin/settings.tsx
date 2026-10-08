import { useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DemoNotice, PageHeading } from '@/components/admin/admin-parts';
import { FieldsForm, type FieldConfig } from '@/components/admin/fields-form';
import { useDemo } from '@/lib/admin/demo-store';
import type { ProfileSettings, WorkspaceSettings } from '@/data/admin/mock';

const workspaceFields: FieldConfig[] = [
  { name: 'workspaceName', label: 'Workspace name', kind: 'text', required: true },
  { name: 'contactEmail', label: 'Workspace contact email', kind: 'email', required: true, help: 'Display only. No messages are routed from this setting.' },
  { name: 'timezone', label: 'Time zone', kind: 'select', required: true, options: ['UTC', 'Africa/Nairobi', 'Africa/Johannesburg', 'Europe/London'] },
  { name: 'language', label: 'Default language', kind: 'select', required: true, options: ['English', 'French', 'Portuguese', 'Arabic'] },
];
const profileFields: FieldConfig[] = [
  { name: 'displayName', label: 'Display name', kind: 'text', required: true },
  { name: 'roleTitle', label: 'Role title', kind: 'text', required: true },
  { name: 'email', label: 'Profile email', kind: 'email', required: true, help: 'Display only. Sign-in credentials are not changed.' },
  { name: 'digest', label: 'Activity digest', kind: 'select', required: true, options: ['Daily', 'Weekly', 'Never'] },
  { name: 'density', label: 'Interface density', kind: 'select', required: true, options: ['Comfortable', 'Compact'] },
  { name: 'messageAlerts', label: 'Message alerts in the header', kind: 'select', required: true, options: ['On', 'Off'] },
];

export default function AdminSettings() {
  const { workspace, profile, saveWorkspace, saveProfile, notify } = useDemo();
  const [wsKey, setWsKey] = useState(0);
  const [pfKey, setPfKey] = useState(0);

  return (
    <AdminLayout>
      <div className="adm-page" data-testid="page-settings">
        <PageHeading kicker="Settings" title="Settings" lede="Adjust workspace and profile preferences for this session. No credentials or accounts are changed." />
        <DemoNotice />
        <div className="adm-settings-grid">
          <section className="adm-card" aria-labelledby="ws-title">
            <h2 id="ws-title">Workspace</h2>
            <p>Shown across the admin workspace.</p>
            <FieldsForm key={`ws-${wsKey}-${workspace.workspaceName}-${workspace.contactEmail}-${workspace.timezone}-${workspace.language}`} fields={workspaceFields} defaults={{ ...workspace }} testPrefix="workspace" submitLabel="Save workspace" cancelLabel="Discard changes"
              onCancel={() => { setWsKey((k) => k + 1); notify('Workspace changes discarded.', 'info'); }}
              onSubmit={(v) => saveWorkspace(v as unknown as WorkspaceSettings)} />
          </section>
          <section className="adm-card" aria-labelledby="pf-title">
            <h2 id="pf-title">Profile and preferences</h2>
            <p>Display name, role, and density update the header and layout immediately after saving.</p>
            <FieldsForm key={`pf-${pfKey}-${Object.values(profile).join('|')}`} fields={profileFields} defaults={{ ...profile }} testPrefix="profile" submitLabel="Save preferences" cancelLabel="Discard changes"
              onCancel={() => { setPfKey((k) => k + 1); notify('Profile changes discarded.', 'info'); }}
              onSubmit={(v) => saveProfile(v as unknown as ProfileSettings)} />
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
