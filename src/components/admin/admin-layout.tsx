'use client';

import { type ReactNode, useEffect, useState } from 'react';
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  Handshake,
  HeartHandshake,
  Image,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Mic2,
  Newspaper,
  Settings,
  UserCog,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin/api-client';
import { useAdmin } from '@/lib/admin/admin-store';
import { initialsOf } from '@/lib/admin/format';

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Only shown to administrators (the page and API enforce it as well). */
  adminOnly?: boolean;
};

const navigationSections: { label?: string; items: NavigationItem[] }[] = [
  { items: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard }] },
  {
    label: 'CONTENT',
    items: [
      { label: 'Team', href: '/admin/team', icon: Users },
      { label: 'Events', href: '/admin/events', icon: CalendarDays },
      { label: 'Media', href: '/admin/media', icon: Image },
      { label: 'News', href: '/admin/news', icon: Newspaper },
      { label: 'Programs', href: '/admin/programs', icon: BriefcaseBusiness },
    ],
  },
  {
    label: 'ORGANISATION',
    items: [
      { label: 'Voices', href: '/admin/voices', icon: Mic2 },
      { label: 'Partners', href: '/admin/partners', icon: Handshake },
    ],
  },
  {
    label: 'ENGAGEMENT',
    items: [
      { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
      { label: 'Volunteers', href: '/admin/volunteers', icon: HeartHandshake },
      { label: 'Newsletter', href: '/admin/newsletter', icon: Mail },
    ],
  },
  {
    label: 'SETTINGS',
    items: [
      { label: 'Users', href: '/admin/users', icon: UserCog, adminOnly: true },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

const pageTitles = new Map(navigationSections.flatMap((section) => section.items.map((item) => [item.href, item.label])));

function Sidebar({ location, isAdmin, onNavigate, onLogout }: { location: string; isAdmin: boolean; onNavigate: () => void; onLogout: () => void }) {
  return (
    <aside id="admin-navigation" className="admin-shell-sidebar" aria-label="Admin navigation">
      <div className="admin-shell-sidebar-brand">
        <Link href="/admin" className="admin-shell-brand focus-ring" onClick={onNavigate}>
          <span className="admin-shell-brand-mark" aria-hidden="true">IC</span>
          <span>
            <strong>ICAADA</strong>
            <small>Admin workspace</small>
          </span>
        </Link>
      </div>

      <nav className="admin-shell-nav">
        {navigationSections.map((section) => (
          <div className="admin-shell-nav-group" key={section.label ?? 'dashboard'}>
            {section.label && <p className="admin-shell-nav-label">{section.label}</p>}
            <div className="admin-shell-nav-items">
              {section.items.filter((item) => isAdmin || !item.adminOnly).map((item) => {
                const isActive = item.href === '/admin'
                  ? location === '/admin'
                  : location === item.href || location.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    href={item.href}
                    key={item.href}
                    className={`admin-shell-nav-link${isActive ? ' is-active' : ''} focus-ring`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={onNavigate}
                  >
                    <Icon size={16} strokeWidth={isActive ? 2.3 : 1.8} aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="admin-shell-sidebar-footer">
        <button type="button" className="admin-shell-logout focus-ring" onClick={onLogout} data-testid="button-sidebar-logout">
          <LogOut size={16} aria-hidden="true" />
          Logout
        </button>
      </div>
    </aside>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const location = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(location);
  const { me, workspace, summary, refreshSummary } = useAdmin();
  const unread = summary.unreadMessages;
  const inReview = summary.inReview;
  const messageAlerts = me.preferences.messageAlerts === 'On';
  const alertCount = inReview + (messageAlerts ? unread : 0);
  const initials = initialsOf(me.name) || 'AD';
  const roleTitle = me.roleTitle ?? (me.role === 'ADMIN' ? 'Administrator' : 'Editor');
  const title = pageTitles.get(location) ?? 'Dashboard';

  // Close menus on navigation (adjusting state during render, not in an effect).
  if (openedAt !== location) {
    setOpenedAt(location);
    setMenuOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
  }

  // Keep header counts fresh as editors move between screens.
  useEffect(() => {
    void refreshSummary();
  }, [location, refreshSummary]);

  const logout = async () => {
    try {
      await adminApi.post('/auth/logout');
    } finally {
      router.replace('/admin/login');
      router.refresh();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`admin-shell${me.preferences.density === 'Compact' ? ' is-compact' : ''}`}>
      <div className={`admin-shell-sidebar-wrap${menuOpen ? ' is-open' : ''}`}>
        <Sidebar location={location} isAdmin={me.role === 'ADMIN'} onNavigate={() => setMenuOpen(false)} onLogout={logout} />
      </div>
      {menuOpen && (
        <button
          type="button"
          className="admin-shell-scrim"
          aria-label="Close navigation menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="admin-shell-body">
        <header className="admin-shell-header">
          <div className="admin-shell-header-left">
            <button
              type="button"
              className="admin-shell-menu-button focus-ring"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              aria-controls="admin-navigation"
              title={menuOpen ? 'Close navigation' : 'Open navigation'}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
            <Link href="/admin" className="admin-shell-header-brand focus-ring" aria-label="ICAADA admin dashboard">
              <span className="admin-shell-header-brand-mark" aria-hidden="true">IC</span>
              <strong>ICAADA <span>ADMIN</span></strong>
            </Link>
            <div className="admin-shell-breadcrumb" aria-label="Breadcrumb">
              <span data-testid="text-workspace-name">{workspace.workspaceName}</span>
              <span className="admin-shell-breadcrumb-slash" aria-hidden="true">/</span>
              <strong>{title}</strong>
            </div>
          </div>

          <div className="admin-shell-header-actions">
            <div className="admin-shell-popover-wrap">
              <button
                type="button"
                className={`admin-shell-icon-button focus-ring${notificationsOpen ? ' is-open' : ''}`}
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                title="Notifications"
                onClick={() => {
                  setNotificationsOpen((open) => !open);
                  setProfileOpen(false);
                }}
              >
                <Bell size={18} aria-hidden="true" />
                {alertCount > 0 && <span className="admin-shell-notification-dot" aria-label={`${alertCount} items need attention`} data-testid="badge-notification-count" />}
              </button>
              {notificationsOpen && (
                <div className="admin-shell-popover admin-shell-notification-popover" role="status">
                  <div className="admin-shell-popover-heading">
                    <strong>Notifications</strong>
                    <span data-testid="text-notification-count">{alertCount} new</span>
                  </div>
                  {messageAlerts && <Link href="/admin/messages" className="admin-shell-notification-item" data-testid="link-notification-messages">
                    <span className="admin-shell-notification-marker" aria-hidden="true" />
                    <span><strong>{unread} unread {unread === 1 ? 'message' : 'messages'}</strong><small>Open the inbox</small></span>
                  </Link>}
                  <p className="admin-shell-notification-item">
                    <span className="admin-shell-notification-marker" aria-hidden="true" />
                    <span><strong>{inReview} {inReview === 1 ? 'item' : 'items'} in review</strong><small>Across all content modules</small></span>
                  </p>
                </div>
              )}
            </div>

            <div className="admin-shell-popover-wrap">
              <button
                type="button"
                className={`admin-shell-profile-button focus-ring${profileOpen ? ' is-open' : ''}`}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                onClick={() => {
                  setProfileOpen((open) => !open);
                  setNotificationsOpen(false);
                }}
              >
                <span className="admin-shell-avatar" aria-hidden="true">{initials}</span>
                <span className="admin-shell-profile-copy"><strong data-testid="text-profile-name">{me.name}</strong><small>{roleTitle}</small></span>
                <ChevronDown size={15} aria-hidden="true" />
              </button>
              {profileOpen && (
                <div className="admin-shell-popover admin-shell-profile-popover" role="menu">
                  <div className="admin-shell-profile-summary">
                    <span className="admin-shell-avatar admin-shell-avatar-large" aria-hidden="true">{initials}</span>
                    <span><strong>{me.name}</strong><small>{roleTitle}</small></span>
                  </div>
                  <Link href="/admin/settings" className="admin-shell-popover-link focus-ring" role="menuitem">Account settings</Link>
                  <button type="button" className="admin-shell-popover-link admin-shell-popover-logout focus-ring" role="menuitem" onClick={logout} data-testid="button-profile-logout">
                    <LogOut size={15} aria-hidden="true" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="admin-shell-main">{children}</main>
      </div>
    </div>
  );
}