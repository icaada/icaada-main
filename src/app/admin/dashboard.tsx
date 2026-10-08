import { ArrowUpRight, CalendarDays, ChevronRight, FileText, Image, Inbox, Mail, Plus, Users } from 'lucide-react';
import { Link } from 'wouter';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DemoNotice } from '@/components/admin/admin-parts';
import { formatWhen, useDemo } from '@/lib/admin/demo-store';

const initialsOf = (text: string) => text.split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
const tones = ['red', 'navy', 'ochre', 'slate'];

export default function AdminDashboard() {
  const { records, messages, activity, profile, subscribers } = useDemo();
  const unread = messages.filter((m) => m.status === 'unread').length;
  const reviewQueue = Object.values(records).reduce((n, list) => n + list.filter((r) => r.status === 'review').length, 0);
  const publishedCount = Object.values(records).reduce((n, list) => n + list.filter((r) => r.status === 'published').length, 0);
  const draftNews = records.news.filter((r) => r.status === 'draft' || r.status === 'review').length;
  const upcomingEvents = records.events.filter((r) => r.status !== 'archived').length;

  const summaryItems = [
    { label: 'Team profiles', value: records.team.length, note: `${records.team.filter((r) => r.status === 'published').length} published`, icon: Users, tone: 'red', href: '/admin/team', id: 'team' },
    { label: 'Active events', value: upcomingEvents, note: 'Not archived', icon: CalendarDays, tone: 'blue', href: '/admin/events', id: 'events' },
    { label: 'News drafts', value: draftNews, note: 'Draft or in review', icon: FileText, tone: 'amber', href: '/admin/news', id: 'news' },
    { label: 'Media assets', value: records.media.length, note: `${records.media.filter((r) => r.status === 'published').length} published`, icon: Image, tone: 'green', href: '/admin/media', id: 'media' },
  ];
  const statusItems = [
    { label: 'Content review queue', value: `${reviewQueue} ${reviewQueue === 1 ? 'item' : 'items'}`, detail: reviewQueue ? 'Needs attention' : 'Queue is clear', status: reviewQueue ? 'attention' : 'ready', id: 'review' },
    { label: 'Published records', value: `${publishedCount} ${publishedCount === 1 ? 'item' : 'items'}`, detail: 'Across all modules', status: 'ready', id: 'published' },
    { label: 'Unread messages', value: `${unread} ${unread === 1 ? 'message' : 'messages'}`, detail: unread ? 'Review this week' : 'Inbox is clear', status: unread ? 'attention' : 'ready', id: 'unread' },
  ];

  return (
    <AdminLayout>
      <div className="admin-dashboard-page" data-testid="page-dashboard">
        <section className="admin-dashboard-hero" aria-labelledby="dashboard-title">
          <div className="admin-dashboard-page-heading">
            <div>
              <p className="admin-dashboard-kicker">Workspace overview <span className="admin-dashboard-heading-rule" aria-hidden="true" /> Demo workspace</p>
              <h1 id="dashboard-title">Hello, {profile.displayName}.</h1>
              <p className="admin-dashboard-lede">A clear view of the work moving through ICAADA’s digital desk.</p>
            </div>
            <span className="admin-dashboard-demo-badge"><span aria-hidden="true" /> Demo workspace</span>
          </div>
          <div className="admin-dashboard-hero-foot">
            <p>Counts are live from the demo data. {subscribers.filter((s) => s.status === 'subscribed').length} demo subscribers are active.</p>
            <span className="admin-dashboard-sync"><span aria-hidden="true" /> Resets on refresh</span>
          </div>
        </section>
        <DemoNotice />

        <section className="admin-dashboard-summary-grid" aria-label="Content summary">
          {summaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link href={item.href} className={`admin-dashboard-summary-card is-${item.tone} focus-ring`} key={item.label} data-testid={`card-summary-${item.id}`}>
                <div className="admin-dashboard-card-topline">
                  <span className="admin-dashboard-summary-icon" aria-hidden="true"><Icon size={18} /></span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </div>
                <strong data-testid={`text-count-${item.id}`}>{item.value}</strong>
                <h2>{item.label}</h2>
                <p>{item.note}</p>
              </Link>
            );
          })}
        </section>

        <div className="admin-dashboard-content-grid">
          <section className="admin-dashboard-panel admin-dashboard-activity-panel" aria-labelledby="activity-title">
            <div className="admin-dashboard-panel-heading">
              <div><p className="admin-dashboard-kicker">Workspace pulse</p><h2 id="activity-title">Recent activity</h2></div>
            </div>
            <div className="admin-dashboard-activity-list" data-testid="list-activity">
              {activity.slice(0, 7).map((a, i) => (
                <Link href={a.href} className="admin-dashboard-activity-row focus-ring" key={a.id} data-testid={`row-activity-${a.id}`}>
                  <span className={`admin-dashboard-initials is-${tones[i % tones.length]}`} aria-hidden="true">{initialsOf(a.title)}</span>
                  <div className="admin-dashboard-activity-copy"><strong>{a.title}</strong><span>{a.module} · {a.action}</span></div>
                  <time>{formatWhen(a.at)}</time>
                </Link>
              ))}
            </div>
          </section>

          <section className="admin-dashboard-panel admin-dashboard-quick-panel" aria-labelledby="quick-title">
            <div className="admin-dashboard-panel-heading">
              <div><p className="admin-dashboard-kicker">Shortcuts</p><h2 id="quick-title">Quick actions</h2></div>
            </div>
            <div className="admin-dashboard-quick-list">
              <Link href="/admin/news?new=1" className="admin-dashboard-quick-action focus-ring" data-testid="link-quick-news"><span className="admin-dashboard-quick-icon"><Plus size={17} aria-hidden="true" /></span><span><strong>Start a news draft</strong><small>Add a story for internal review</small></span><ChevronRight size={16} aria-hidden="true" /></Link>
              <Link href="/admin/events?new=1" className="admin-dashboard-quick-action focus-ring" data-testid="link-quick-events"><span className="admin-dashboard-quick-icon"><CalendarDays size={17} aria-hidden="true" /></span><span><strong>Add an event</strong><small>Capture the essential details</small></span><ChevronRight size={16} aria-hidden="true" /></Link>
              <Link href="/admin/media?new=1" className="admin-dashboard-quick-action focus-ring" data-testid="link-quick-media"><span className="admin-dashboard-quick-icon"><Image size={17} aria-hidden="true" /></span><span><strong>Add a media asset</strong><small>Catalogue by URL or local preview</small></span><ChevronRight size={16} aria-hidden="true" /></Link>
            </div>
          </section>
        </div>

        <div className="admin-dashboard-lower-grid">
          <section className="admin-dashboard-panel admin-dashboard-status-panel" aria-labelledby="status-title">
            <div className="admin-dashboard-panel-heading">
              <div><p className="admin-dashboard-kicker">At a glance</p><h2 id="status-title">Operational status</h2></div>
              <span className="admin-dashboard-status-label"><span aria-hidden="true" /> Demo data</span>
            </div>
            <div className="admin-dashboard-status-list">
              {statusItems.map((item) => (
                <div className="admin-dashboard-status-row" key={item.label} data-testid={`status-row-${item.id}`}>
                  <span className={`admin-dashboard-status-dot is-${item.status}`} aria-hidden="true" />
                  <span><strong>{item.label}</strong><small>{item.detail}</small></span>
                  <b data-testid={`text-status-${item.id}`}>{item.value}</b>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-dashboard-panel admin-dashboard-inbox-panel" aria-labelledby="inbox-title">
            <span className="admin-dashboard-inbox-icon" aria-hidden="true"><Inbox size={21} /></span>
            <p className="admin-dashboard-kicker">Engagement</p>
            <h2 id="inbox-title">Keep the conversation moving.</h2>
            <p className="admin-dashboard-inbox-copy" data-testid="text-inbox-copy">{unread === 0 ? 'No demo messages are waiting. The inbox is clear.' : `There ${unread === 1 ? 'is 1 demo message' : `are ${unread} demo messages`} waiting in the inbox.`}</p>
            <Link href="/admin/messages" className="admin-dashboard-button admin-dashboard-button-dark focus-ring" data-testid="link-open-messages">Open messages <Mail size={15} aria-hidden="true" /></Link>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
