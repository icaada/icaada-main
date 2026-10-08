import { ModuleManager } from '@/components/admin/module-manager';
import { moduleConfigs } from '@/components/admin/module-configs';
import type { ModuleKey } from '@/data/admin/mock';

export function createModulePage(key: ModuleKey) {
  const config = moduleConfigs[key];
  return function AdminModulePage() {
    return <ModuleManager key={key} config={config} />;
  };
}

export const AdminTeam = createModulePage('team');
export const AdminEvents = createModulePage('events');
export const AdminMedia = createModulePage('media');
export const AdminVoices = createModulePage('voices');
export const AdminNews = createModulePage('news');
export const AdminPrograms = createModulePage('programs');
export const AdminPartners = createModulePage('partners');
