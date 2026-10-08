import type { ModuleKey, Status } from '@/data/admin/mock';
import type { FieldConfig } from '@/components/admin/fields-form';

export interface ModuleConfig {
  key: ModuleKey;
  label: string;
  singular: string;
  kicker: string;
  lede: string;
  titleKey: string;
  columns: { key: string; label: string }[];
  fields: FieldConfig[];
  previewKey?: string;
}

export const moduleConfigs: Record<ModuleKey, ModuleConfig> = {
  team: {
    key: 'team', label: 'Team', singular: 'team profile', kicker: 'Content', titleKey: 'name',
    lede: 'Draft and review team profiles before they appear on the public team page.',
    columns: [{ key: 'role', label: 'Role' }, { key: 'expertise', label: 'Expertise' }],
    fields: [
      { name: 'name', label: 'Name', kind: 'text', required: true, placeholder: 'Demo team member' },
      { name: 'role', label: 'Role', kind: 'text', required: true },
      { name: 'bio', label: 'Biography', kind: 'textarea', required: true, maxLength: 1200 },
      { name: 'expertise', label: 'Expertise', kind: 'text', required: true, help: 'Separate areas with commas.' },
    ],
  },
  events: {
    key: 'events', label: 'Events', singular: 'event', kicker: 'Content', titleKey: 'title',
    lede: 'Plan events, confirm details, and move them through review to publication.',
    columns: [{ key: 'date', label: 'Date' }, { key: 'location', label: 'Location' }],
    fields: [
      { name: 'title', label: 'Title', kind: 'text', required: true },
      { name: 'date', label: 'Date', kind: 'date', required: true },
      { name: 'location', label: 'Location', kind: 'text', required: true },
      { name: 'description', label: 'Description', kind: 'textarea', required: true },
    ],
  },
  media: {
    key: 'media', label: 'Media', singular: 'media asset', kicker: 'Content', titleKey: 'title',
    lede: 'Catalogue images, video, and documents by URL. Local files are previewed only and never uploaded.',
    columns: [{ key: 'type', label: 'Type' }, { key: 'altText', label: 'Alt text' }],
    fields: [
      { name: 'title', label: 'Title', kind: 'text', required: true },
      { name: 'type', label: 'Type', kind: 'select', required: true, options: ['Image', 'Video', 'Document', 'Audio'] },
      { name: 'assetUrl', label: 'Asset URL', kind: 'asset', required: true, placeholder: 'https://example.org/demo/file.jpg' },
      { name: 'altText', label: 'Alt text', kind: 'text', required: true, help: 'Describe the asset for people using assistive technology.' },
      { name: 'caption', label: 'Caption', kind: 'textarea' },
    ],
    previewKey: 'assetUrl',
  },
  voices: {
    key: 'voices', label: 'Voices', singular: 'voice', kicker: 'Organisation', titleKey: 'name',
    lede: 'Hold quotations and perspectives for review. Confirm consent before anything is published.',
    columns: [{ key: 'role', label: 'Role' }, { key: 'quote', label: 'Quote' }],
    fields: [
      { name: 'name', label: 'Name', kind: 'text', required: true },
      { name: 'role', label: 'Role', kind: 'text', required: true },
      { name: 'quote', label: 'Quote', kind: 'textarea', required: true, maxLength: 600 },
    ],
  },
  news: {
    key: 'news', label: 'News', singular: 'news article', kicker: 'Content', titleKey: 'title',
    lede: 'Write, review, and publish newsroom articles.',
    columns: [{ key: 'category', label: 'Category' }, { key: 'excerpt', label: 'Excerpt' }],
    fields: [
      { name: 'title', label: 'Title', kind: 'text', required: true },
      { name: 'category', label: 'Category', kind: 'select', required: true, options: ['Announcement', 'Reflection', 'Programme update', 'Resource'] },
      { name: 'excerpt', label: 'Excerpt', kind: 'textarea', required: true, maxLength: 300 },
      { name: 'body', label: 'Body', kind: 'textarea', required: true },
    ],
  },
  programs: {
    key: 'programs', label: 'Programs', singular: 'program', kicker: 'Content', titleKey: 'title',
    lede: 'Track programme descriptions and the stage each one has reached.',
    columns: [{ key: 'stage', label: 'Stage' }, { key: 'description', label: 'Description' }],
    fields: [
      { name: 'title', label: 'Title', kind: 'text', required: true },
      { name: 'stage', label: 'Stage', kind: 'select', required: true, options: ['Concept', 'Planning', 'Active', 'Review', 'Closed'] },
      { name: 'description', label: 'Description', kind: 'textarea', required: true },
    ],
  },
  partners: {
    key: 'partners', label: 'Partners', singular: 'partner', kicker: 'Organisation', titleKey: 'name',
    lede: 'Maintain the partner directory. Demo entries are placeholders, not real relationships.',
    columns: [{ key: 'type', label: 'Type' }, { key: 'website', label: 'Website' }],
    fields: [
      { name: 'name', label: 'Name', kind: 'text', required: true },
      { name: 'type', label: 'Type', kind: 'select', required: true, options: ['Institutional', 'Community', 'Funder', 'Technical'] },
      { name: 'description', label: 'Description', kind: 'textarea', required: true },
      { name: 'website', label: 'Website', kind: 'url', placeholder: 'https://example.org' },
    ],
  },
};

export const statusTransitions: Record<Status, { to: Status; label: string }[]> = {
  draft: [{ to: 'review', label: 'Submit for review' }, { to: 'published', label: 'Publish' }],
  review: [{ to: 'published', label: 'Publish' }, { to: 'draft', label: 'Return to draft' }],
  published: [{ to: 'archived', label: 'Archive' }, { to: 'draft', label: 'Unpublish' }],
  archived: [{ to: 'draft', label: 'Restore as draft' }],
};

export const statusFilterOptions = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In review' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];
