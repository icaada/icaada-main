'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, ChevronRight, FileText, Image as ImageIcon, Inbox, Mail, Plus, Users } from 'lucide-react';
import { adminApi, errorMessage } from '@/lib/admin/api-client';
import { useAdmin } from '@/lib/admin/admin-store';
import { formatWhen, initialsOf } from '@/lib/admin/format';
import type { ActivityDto } from '@/Services/activity.service';

const tones = ['red', 'navy', 'ochre', 'slate'];

/** Where an activity entry links to, by ActivityLog.entityType. */
const entityRoutes: Record<string, { label: string; href: string }> = {
  team: { label: 'Team', href: '/admin/team' },
  event: { label: 'Events', href: '/admin/events' },
  media: { label: 'Media', href: '/admin/media' },
  news: { label: 'News', href: '/admin/news' },
  program: { label: 'Programs', href: '/admin/programs' },
  voice: { label: 'Voices', href: '/admin/voices' },
  partner: { label: 'Partners', href: '/admin/partners' },
  message: { label: 'Messages', href: '/admin/messages' },
  subscriber: { label: 'Newsletter', href: '/admin/newsletter' },
  newsletter: { label: 'Newsletter', href: '/admin/newsletter' },
  volunteer: { label: 'Volunteers', href: '/admin/volunteers' },
  settings: { label: 'Settings', href: '/admin/settings' },
  profile: { label: 'Profile', href: '/admin/settings' },
  user: { label: 'Accounts', href: '/admin/settings' },
};

export default function AdminDashboard() {
  const { me, summary, workspace } = useAdmin();
  const [activity, setActivity] = useState<ActivityDto[] | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.get<ActivityDto[]>('/admin/activity?pageSize=7')
      .then(({ data }) => setActivity(data))
      .catch((error) => setActivityError(errorMessage(error)));
  }, []);

  const { content } = summary;
  const unread = summary.unreadMessages;
  const reviewQueue = summary.inReview;
  const publishedCount = summary.published;
  const draftNews = content.news.DRAFT + content.news.REVIEW;
  const upcomingEvents = content.events.total - content.events.ARCHIVED;

  const summaryItems = [
    { label: 'Team profiles', value: content.team.total, note: `${content.team.PUBLISHED} published`, icon: Users, tone: 'red', href: '/admin/team', id: 'team' },
    { label: 'Active events', value: upcomingEvents, note: 'Not archived', icon: CalendarDays, tone: 'blue', href: '/admin/events', id: 'events' },
    { label: 'News drafts', value: draftNews, note: 'Draft or in review', icon: FileText, tone: 'amber', href: '/admin/news', id: 'news' },
    { label: 'Media assets', value: content.media.total, note: `${content.media.PUBLISHED} published`, icon: ImageIcon, tone: 'green', href: '/admin/media', id: 'media' },
  ];
  const statusItems = [
    { label: 'Content review queue', value: `${reviewQueue} ${reviewQueue === 1 ? 'item' : 'items'}`, detail: reviewQueue ? 'Needs attention' : 'Queue is clear', status: reviewQueue ? 'attention' : 'ready', id: 'review' },
    { label: 'Published records', value: `${publishedCount} ${publishedCount === 1 ? 'item' : 'items'}`, detail: 'Across all modules', status: 'ready', id: 'published' },
    { label: 'Unread messages', value: `${unread} ${unread === 1 ? 'message' : 'messages'}`, detail: unread ? 'Review this week' : 'Inbox is clear', status: unread ? 'attention' : 'ready', id: 'unread' },
  ];

  return (
    <div className="admin-dashboard-page" data-testid="page-dashboard">
      <section className="admin-dashboard-hero" aria-labelledby="dashboard-title">
        <div className="admin-dashboard-page-heading">
          <div>
            <p className="admin-dashboard-kicker">Workspace overview <span className="admin-dashboard-heading-rule" aria-hidden="true" /> {workspace.workspaceName}</p>
            <h1 id="dashboard-title">Hello, {me.name}.</h1>
            <p className="admin-dashboard-lede">A clear view of the work moving through ICAADA’s digital desk.</p>
          </div>
          <span className="admin-dashboard-demo-badge"><span aria-hidden="true" /> {me.role === 'ADMIN' ? 'Administrator' : 'Editor'}</span>
        </div>
        <div className="admin-dashboard-hero-foot">
          <p data-testid="text-hero-counts">{summary.activeSubscribers} newsletter {summary.activeSubscribers === 1 ? 'subscriber is' : 'subscribers are'} active. {summary.newVolunteers} new volunteer {summary.newVolunteers === 1 ? 'application' : 'applications'}.</p>
          <span className="admin-dashboard-sync"><span aria-hidden="true" /> Live data</span>
        </div>
      </section>

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
            {activityError && <p className="adm-form-error" role="alert">{activityError}</p>}
            {!activity && !activityError && <p className="adm-count" role="status">Loading…</p>}
            {activity?.length === 0 && <p className="adm-count">No activity yet.</p>}
            {activity?.map((a, i) => {
              const route = entityRoutes[a.entityType] ?? { label: a.entityType, href: '/admin' };
              const who = a.actor?.name ?? 'Website visitor';
              return (
                <Link href={route.href} className="admin-dashboard-activity-row focus-ring" key={a.id} data-testid={`row-activity-${a.id}`}>
                  <span className={`admin-dashboard-initials is-${tones[i % tones.length]}`} aria-hidden="true">{initialsOf(who)}</span>
                  <div className="admin-dashboard-activity-copy"><strong>{a.summary}</strong><span>{route.label} · {who}</span></div>
                  <time dateTime={a.createdAt}>{formatWhen(a.createdAt)}</time>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="admin-dashboard-panel admin-dashboard-quick-panel" aria-labelledby="quick-title">
          <div className="admin-dashboard-panel-heading">
            <div><p className="admin-dashboard-kicker">Shortcuts</p><h2 id="quick-title">Quick actions</h2></div>
          </div>
          <div className="admin-dashboard-quick-list">
            <Link href="/admin/news?new=1" className="admin-dashboard-quick-action focus-ring" data-testid="link-quick-news"><span className="admin-dashboard-quick-icon"><Plus size={17} aria-hidden="true" /></span><span><strong>Start a news draft</strong><small>Add a story for internal review</small></span><ChevronRight size={16} aria-hidden="true" /></Link>
            <Link href="/admin/events?new=1" className="admin-dashboard-quick-action focus-ring" data-testid="link-quick-events"><span className="admin-dashboard-quick-icon"><CalendarDays size={17} aria-hidden="true" /></span><span><strong>Add an event</strong><small>Capture the essential details</small></span><ChevronRight size={16} aria-hidden="true" /></Link>
            <Link href="/admin/media?new=1" className="admin-dashboard-quick-action focus-ring" data-testid="link-quick-media"><span className="admin-dashboard-quick-icon"><ImageIcon size={17} aria-hidden="true" /></span><span><strong>Add a media asset</strong><small>Upload an image, video or document</small></span><ChevronRight size={16} aria-hidden="true" /></Link>
          </div>
        </section>
      </div>

      <div className="admin-dashboard-lower-grid">
        <section className="admin-dashboard-panel admin-dashboard-status-panel" aria-labelledby="status-title">
          <div className="admin-dashboard-panel-heading">
            <div><p className="admin-dashboard-kicker">At a glance</p><h2 id="status-title">Operational status</h2></div>
            <span className="admin-dashboard-status-label"><span aria-hidden="true" /> Live</span>
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
          <p className="admin-dashboard-inbox-copy" data-testid="text-inbox-copy">{unread === 0 ? 'No messages are waiting. The inbox is clear.' : `There ${unread === 1 ? 'is 1 unread message' : `are ${unread} unread messages`} in the inbox.`}</p>
          <Link href="/admin/messages" className="admin-dashboard-button admin-dashboard-button-dark focus-ring" data-testid="link-open-messages">Open messages <Mail size={15} aria-hidden="true" /></Link>
        </section>
      </div>
    </div>
  );
}
