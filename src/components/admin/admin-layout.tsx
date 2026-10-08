import { type ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  Handshake,
  Image,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Mic2,
  Newspaper,
  Settings,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useDemo } from '@/lib/admin/demo-store';

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
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
      { label: 'Newsletter', href: '/admin/newsletter', icon: Mail },
    ],
  },
  {
    label: 'SETTINGS',
    items: [{ label: 'Settings', href: '/admin/settings', icon: Settings }],
  },
];

const pageTitles = new Map(navigationSections.flatMap((section) => section.items.map((item) => [item.href, item.label])));

function Sidebar({ location, onNavigate }: { location: string; onNavigate: () => void }) {
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
              {section.items.map((item) => {
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
        <Link href="/admin/login" className="admin-shell-logout focus-ring" onClick={onNavigate}>
          <LogOut size={16} aria-hidden="true" />
          Logout
        </Link>
      </div>
    </aside>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { messages, records, profile, workspace } = useDemo();
  const unread = messages.filter((m) => m.status === 'unread').length;
  const inReview = Object.values(records).reduce((n, list) => n + list.filter((r) => r.status === 'review').length, 0);
  const alertCount = inReview + (profile.messageAlerts === 'On' ? unread : 0);
  const initials = profile.displayName.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'AD';
  const title = useMemo(() => pageTitles.get(location) ?? 'Dashboard', [location]);

  useEffect(() => {
    setMenuOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
  }, [location]);

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
    <div className={`admin-shell${profile.density === 'Compact' ? ' is-compact' : ''}`}>
      <div className={`admin-shell-sidebar-wrap${menuOpen ? ' is-open' : ''}`}>
        <Sidebar location={location} onNavigate={() => setMenuOpen(false)} />
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
                  {profile.messageAlerts === 'On' && <Link href="/admin/messages" className="admin-shell-notification-item" data-testid="link-notification-messages">
                    <span className="admin-shell-notification-marker" aria-hidden="true" />
                    <span><strong>{unread} unread {unread === 1 ? 'message' : 'messages'}</strong><small>Open the inbox</small></span>
                  </Link>}
                  <p className="admin-shell-notification-item">
                    <span className="admin-shell-notification-marker" aria-hidden="true" />
                    <span><strong>{inReview} {inReview === 1 ? 'item' : 'items'} in review</strong><small>Demo workspace. Resets on refresh.</small></span>
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
                <span className="admin-shell-profile-copy"><strong data-testid="text-profile-name">{profile.displayName}</strong><small>{profile.roleTitle}</small></span>
                <ChevronDown size={15} aria-hidden="true" />
              </button>
              {profileOpen && (
                <div className="admin-shell-popover admin-shell-profile-popover" role="menu">
                  <div className="admin-shell-profile-summary">
                    <span className="admin-shell-avatar admin-shell-avatar-large" aria-hidden="true">{initials}</span>
                    <span><strong>{profile.displayName}</strong><small>{profile.roleTitle}</small></span>
                  </div>
                  <Link href="/admin/settings" className="admin-shell-popover-link focus-ring" role="menuitem">Account settings</Link>
                  <Link href="/admin/login" className="admin-shell-popover-link admin-shell-popover-logout focus-ring" role="menuitem">
                    <LogOut size={15} aria-hidden="true" /> Logout
                  </Link>
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