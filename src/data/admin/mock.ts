// Demo-only seed data for the ICAADA admin workspace.
// Every record is an obvious placeholder. Nothing here describes real people,
// partners, or achievements. Emails use the reserved example.org domain.

export type Status = "draft" | "review" | "published" | "archived";
export type ModuleKey =
  | "team"
  | "events"
  | "media"
  | "voices"
  | "news"
  | "programs"
  | "partners";

export type ModuleRecord = {
  id: string;
  status: Status;
  updatedAt: string;
} & Record<string, string>;

export type MessageStatus = "unread" | "read" | "archived";
export interface InboxMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  status: MessageStatus;
  receivedAt: string;
  replyDraft: string;
  replySavedAt: string | null;
}

export type SubscriberStatus = "subscribed" | "unsubscribed";
export interface Subscriber {
  id: string;
  name: string;
  email: string;
  status: SubscriberStatus;
  updatedAt: string;
}

export interface NewsletterDraft {
  id: string;
  subject: string;
  body: string;
  status: "draft";
  updatedAt: string;
}

export interface ActivityEntry {
  id: string;
  title: string;
  action: string;
  module: string;
  href: string;
  at: string;
}

export interface WorkspaceSettings {
  workspaceName: string;
  contactEmail: string;
  timezone: string;
  language: string;
}
export interface ProfileSettings {
  displayName: string;
  roleTitle: string;
  email: string;
  digest: string;
  density: string;
  messageAlerts: string;
}

const t = (hoursAgo: number) =>
  new Date(Date.UTC(2025, 0, 15, 12) - hoursAgo * 3600_000).toISOString();

export const seedRecords: Record<ModuleKey, ModuleRecord[]> = {
  team: [
    {
      id: "team-1",
      status: "published",
      updatedAt: t(30),
      name: "Demo Team Member A",
      role: "Placeholder role",
      bio: "Placeholder biography text for interface review only.",
      expertise: "Sample topic one, Sample topic two",
    },
    {
      id: "team-2",
      status: "review",
      updatedAt: t(20),
      name: "Demo Team Member B",
      role: "Placeholder role",
      bio: "Second placeholder biography. Replace with approved copy.",
      expertise: "Sample topic three",
    },
    {
      id: "team-3",
      status: "draft",
      updatedAt: t(8),
      name: "Demo Team Member C",
      role: "Placeholder role",
      bio: "Draft placeholder profile awaiting content.",
      expertise: "Sample topic four, Sample topic five",
    },
  ],
  events: [
    {
      id: "event-1",
      status: "published",
      updatedAt: t(48),
      title: "Demo Event One",
      date: "2025-03-10",
      location: "Placeholder venue",
      description: "Placeholder description for a sample event entry.",
    },
    {
      id: "event-2",
      status: "review",
      updatedAt: t(26),
      title: "Demo Event Two",
      date: "2025-04-22",
      location: "Online (demo)",
      description: "Sample event waiting for review in the demo queue.",
    },
    {
      id: "event-3",
      status: "draft",
      updatedAt: t(5),
      title: "Demo Event Three",
      date: "2025-06-05",
      location: "To be confirmed",
      description: "Early placeholder draft with minimal detail.",
    },
  ],
  media: [
    {
      id: "media-1",
      status: "published",
      updatedAt: t(40),
      title: "Demo Image Asset",
      type: "Image",
      assetUrl: "https://example.org/demo/image.jpg",
      altText: "Placeholder alt text for a demo image",
      caption: "Demo caption. No real image is attached.",
    },
    {
      id: "media-2",
      status: "review",
      updatedAt: t(22),
      title: "Demo Document Asset",
      type: "Document",
      assetUrl: "https://example.org/demo/document.pdf",
      altText: "Placeholder document description",
      caption: "Demo document entry.",
    },
    {
      id: "media-3",
      status: "draft",
      updatedAt: t(6),
      title: "Demo Video Asset",
      type: "Video",
      assetUrl: "https://example.org/demo/video.mp4",
      altText: "Placeholder video description",
      caption: "",
    },
  ],
  voices: [
    {
      id: "voice-1",
      status: "published",
      updatedAt: t(36),
      name: "Demo Voice A",
      role: "Placeholder role",
      quote: "This is placeholder quote text for interface review.",
    },
    {
      id: "voice-2",
      status: "review",
      updatedAt: t(18),
      name: "Demo Voice B",
      role: "Placeholder role",
      quote: "A second placeholder quotation, not attributed to anyone.",
    },
    {
      id: "voice-3",
      status: "draft",
      updatedAt: t(4),
      name: "Demo Voice C",
      role: "Placeholder role",
      quote: "Draft placeholder quote awaiting consent and approval.",
    },
  ],
  news: [
    {
      id: "news-1",
      status: "published",
      updatedAt: t(52),
      title: "Demo news article one",
      category: "Announcement",
      excerpt: "Placeholder excerpt for a published demo article.",
      body: "Placeholder body text. This article exists only to demonstrate the editorial workflow.",
    },
    {
      id: "news-2",
      status: "review",
      updatedAt: t(25),
      title: "Demo news article two",
      category: "Reflection",
      excerpt: "Placeholder excerpt awaiting review.",
      body: "Placeholder body text for a reflection piece in the review queue.",
    },
    {
      id: "news-3",
      status: "draft",
      updatedAt: t(3),
      title: "Demo news article three",
      category: "Programme update",
      excerpt: "Placeholder draft excerpt.",
      body: "Placeholder draft body text.",
    },
  ],
  programs: [
    {
      id: "program-1",
      status: "published",
      updatedAt: t(60),
      title: "Demo Programme One",
      stage: "Active",
      description: "Placeholder programme description for review.",
    },
    {
      id: "program-2",
      status: "review",
      updatedAt: t(28),
      title: "Demo Programme Two",
      stage: "Planning",
      description: "Placeholder programme in planning stage.",
    },
    {
      id: "program-3",
      status: "draft",
      updatedAt: t(7),
      title: "Demo Programme Three",
      stage: "Concept",
      description: "Placeholder concept note.",
    },
  ],
  partners: [
    {
      id: "partner-1",
      status: "published",
      updatedAt: t(70),
      name: "Demo Partner Organisation A",
      type: "Institutional",
      description: "Placeholder partner entry. Not a real organisation.",
      website: "https://example.org/partner-a",
    },
    {
      id: "partner-2",
      status: "review",
      updatedAt: t(30),
      name: "Demo Partner Organisation B",
      type: "Community",
      description: "Placeholder community partner entry.",
      website: "https://example.org/partner-b",
    },
    {
      id: "partner-3",
      status: "draft",
      updatedAt: t(9),
      name: "Demo Partner Organisation C",
      type: "Technical",
      description: "Placeholder draft partner entry.",
      website: "https://example.org/partner-c",
    },
  ],
};

export const seedMessages: InboxMessage[] = [
  {
    id: "msg-1",
    name: "Demo Sender One",
    email: "sender.one@example.org",
    subject: "Demo enquiry about a programme",
    body: "This is placeholder message text used to demonstrate the inbox. It is not a real enquiry.",
    status: "unread",
    receivedAt: t(2),
    replyDraft: "",
    replySavedAt: null,
  },
  {
    id: "msg-2",
    name: "Demo Sender Two",
    email: "sender.two@example.org",
    subject: "Demo partnership question",
    body: "Placeholder message about working together. Demo content only.",
    status: "unread",
    receivedAt: t(14),
    replyDraft: "",
    replySavedAt: null,
  },
  {
    id: "msg-3",
    name: "Demo Sender Three",
    email: "sender.three@example.org",
    subject: "Demo media request",
    body: "Placeholder request for sample materials. No real request exists.",
    status: "read",
    receivedAt: t(40),
    replyDraft: "Placeholder draft reply.",
    replySavedAt: t(39),
  },
  {
    id: "msg-4",
    name: "Demo Sender Four",
    email: "sender.four@example.org",
    subject: "Demo volunteer interest",
    body: "Placeholder note about volunteering. Demo content only.",
    status: "archived",
    receivedAt: t(90),
    replyDraft: "",
    replySavedAt: null,
  },
];

export const seedSubscribers: Subscriber[] = [
  {
    id: "sub-1",
    name: "Demo Subscriber One",
    email: "subscriber.one@example.org",
    status: "subscribed",
    updatedAt: t(100),
  },
  {
    id: "sub-2",
    name: "Demo Subscriber Two",
    email: "subscriber.two@example.org",
    status: "subscribed",
    updatedAt: t(80),
  },
  {
    id: "sub-3",
    name: "Demo Subscriber Three",
    email: "subscriber.three@example.org",
    status: "unsubscribed",
    updatedAt: t(60),
  },
];

export const seedDrafts: NewsletterDraft[] = [
  {
    id: "nl-1",
    subject: "Demo newsletter draft",
    body: "Placeholder newsletter body.\n\nSecond paragraph of demo copy. Nothing here can be sent.",
    status: "draft",
    updatedAt: t(12),
  },
];

export const seedActivity: ActivityEntry[] = [
  {
    id: "act-seed-1",
    title: "Demo News article two",
    action: "Submitted for review",
    module: "News",
    href: "/admin/news",
    at: t(25),
  },
  {
    id: "act-seed-2",
    title: "Demo Event Three",
    action: "Created draft",
    module: "Events",
    href: "/admin/events",
    at: t(5),
  },
  {
    id: "act-seed-3",
    title: "Demo Team Member B",
    action: "Submitted for review",
    module: "Team",
    href: "/admin/team",
    at: t(20),
  },
];

export const seedWorkspace: WorkspaceSettings = {
  workspaceName: "ICAADA demo workspace",
  contactEmail: "workspace@example.org",
  timezone: "UTC",
  language: "English",
};

export const seedProfile: ProfileSettings = {
  displayName: "Admin",
  roleTitle: "Content administrator",
  email: "admin@example.org",
  digest: "Weekly",
  density: "Comfortable",
  messageAlerts: "On",
};
