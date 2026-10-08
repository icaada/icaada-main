import { Suspense } from 'react';
import { ModuleManager } from '@/components/admin/module-manager';
import { moduleConfigs, type ModuleKey } from '@/components/admin/module-configs';

/** Page component for one content module (ModuleManager reads ?new=1, hence Suspense). */
export function createModulePage(key: ModuleKey) {
  const config = moduleConfigs[key];
  return function AdminModulePage() {
    return (
      <Suspense>
        <ModuleManager key={key} config={config} />
      </Suspense>
    );
  };
}
