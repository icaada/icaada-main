'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { adminApi } from '@/lib/admin/api-client';
import type { AdminSummaryDto } from '@/Services/dashboard.service';
import type { WorkspaceSettingsDto } from '@/Services/settings.service';
import type { UserDto } from '@/Services/user.service';

// Session-wide admin state: the signed-in user, workspace settings, header
// counts, and toasts. Initial values come from the server layout; screens
// fetch their own lists through useAdminList.

type Tone = 'success' | 'danger' | 'info';
interface Toast {
  id: number;
  message: string;
  tone: Tone;
}

interface AdminContextValue {
  me: UserDto;
  setMe: (user: UserDto) => void;
  workspace: WorkspaceSettingsDto;
  setWorkspace: (settings: WorkspaceSettingsDto) => void;
  summary: AdminSummaryDto;
  refreshSummary: () => Promise<void>;
  notify: (message: string, tone?: Tone) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({
  initialMe,
  initialWorkspace,
  initialSummary,
  children,
}: {
  initialMe: UserDto;
  initialWorkspace: WorkspaceSettingsDto;
  initialSummary: AdminSummaryDto;
  children: ReactNode;
}) {
  const [me, setMe] = useState(initialMe);
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [summary, setSummary] = useState(initialSummary);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextToastId = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((current) => current.filter((t) => t.id !== id)), []);

  const notify = useCallback(
    (message: string, tone: Tone = 'success') => {
      const id = ++nextToastId.current;
      setToasts((current) => [...current.slice(-3), { id, message, tone }]);
      window.setTimeout(() => dismiss(id), tone === 'danger' ? 7000 : 4000);
    },
    [dismiss],
  );

  const refreshSummary = useCallback(async () => {
    try {
      setSummary((await adminApi.get<AdminSummaryDto>('/admin/summary')).data);
    } catch {
      // Header counts are best-effort; the screens surface their own errors.
    }
  }, []);

  return (
    <AdminContext.Provider value={{ me, setMe, workspace, setWorkspace, summary, refreshSummary, notify }}>
      {children}
      <div className="adm-toasts" aria-live="polite" role="status">
        {toasts.map((toast) => (
          <div key={toast.id} className={`adm-toast${toast.tone === 'success' ? '' : ` is-${toast.tone}`}`} data-testid="toast">
            <span>{toast.message}</span>
            <button type="button" aria-label="Dismiss notification" onClick={() => dismiss(toast.id)}>×</button>
          </div>
        ))}
      </div>
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextValue {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used inside <AdminProvider>.');
  return context;
}
