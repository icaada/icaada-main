import type { FieldConfig } from '@/components/admin/fields-form';
import type { ContentModule } from '@/lib/cache';
import type { ContentStatus } from '@/Schemas/common.schema';

export type ModuleKey = ContentModule;

export interface ModuleConfig {
  key: ModuleKey;
  label: string;
  singular: string;
  kicker: string;
  lede: string;
  /** DTO field shown as the row title. */
  titleKey: string;
  /** Extra list columns (DTO field names). */
  columns: { key: string; label: string }[];
  /** Editable fields, named exactly as the API's create/update schema. */
  fields: FieldConfig[];
  /** DTO field holding an image to preview in the details dialog. */
  previewKey?: string;
}

const imageField = (folder: string, label = 'Image', name = 'imageUrl', publicIdField = 'imagePublicId'): FieldConfig => ({
  name, label, kind: 'asset', publicIdField, uploadFolder: folder, accept: 'image/*',
  placeholder: 'https://res.cloudinary.com/…', help: 'Upload an image, or paste a Cloudinary URL.',
});

export const moduleConfigs: Record<ModuleKey, ModuleConfig> = {
  team: {
    key: 'team', label: 'Team', singular: 'team profile', kicker: 'Content', titleKey: 'name',
    lede: 'Draft and review team profiles before they appear on the public team page.',
    columns: [{ key: 'position', label: 'Position' }, { key: 'expertise', label: 'Expertise' }],
    previewKey: 'imageUrl',
    fields: [
      { name: 'name', label: 'Name', kind: 'text', required: true, maxLength: 120 },
      { name: 'position', label: 'Position', kind: 'text', required: true, maxLength: 160 },
      { name: 'biography', label: 'Biography', kind: 'textarea', required: true, maxLength: 5000 },
      imageField('team', 'Photo'),
      { name: 'expertise', label: 'Expertise', kind: 'list', help: 'Separate areas with commas.' },
      { name: 'responsibilities', label: 'Responsibilities', kind: 'lines', help: 'One responsibility per line.' },
      { name: 'email', label: 'Email', kind: 'email' },
      { name: 'phone', label: 'Phone', kind: 'text', maxLength: 40 },
      { name: 'location', label: 'Location', kind: 'text', maxLength: 120 },
    ],
  },
  events: {
    key: 'events', label: 'Events', singular: 'event', kicker: 'Content', titleKey: 'title',
    lede: 'Plan events, confirm details, and move them through review to publication.',
    columns: [{ key: 'dateLabel', label: 'Date' }, { key: 'location', label: 'Location' }],
    previewKey: 'imageUrl',
    fields: [
      { name: 'title', label: 'Title', kind: 'text', required: true },
      { name: 'type', label: 'Type', kind: 'text', required: true, maxLength: 80, placeholder: 'Summit, Dialogue, Workshop…' },
      { name: 'phase', label: 'Phase', kind: 'select', required: true, options: [
        { value: 'ENVISIONED', label: 'Envisioned' }, { value: 'UPCOMING', label: 'Upcoming' },
        { value: 'ONGOING', label: 'Ongoing' }, { value: 'PAST', label: 'Past' },
      ] },
      { name: 'location', label: 'Location', kind: 'text', required: true },
      { name: 'startsAt', label: 'Start date', kind: 'date' },
      { name: 'endsAt', label: 'End date', kind: 'date' },
      { name: 'dateLabel', label: 'Date label', kind: 'text', maxLength: 120, help: 'Shown when there is no exact date, e.g. "Date to be announced".' },
      { name: 'description', label: 'Description', kind: 'textarea', required: true, maxLength: 2000 },
      { name: 'body', label: 'Full details', kind: 'textarea', maxLength: 20000 },
      imageField('events'),
    ],
  },
  media: {
    key: 'media', label: 'Media', singular: 'media asset', kicker: 'Content', titleKey: 'title',
    lede: 'Catalogue images, video, documents and audio. Files upload straight to Cloudinary.',
    columns: [{ key: 'type', label: 'Type' }, { key: 'category', label: 'Category' }],
    previewKey: 'imageUrl',
    fields: [
      { name: 'title', label: 'Title', kind: 'text', required: true },
      { name: 'type', label: 'Type', kind: 'select', required: true, options: [
        { value: 'IMAGE', label: 'Image' }, { value: 'VIDEO', label: 'Video' },
        { value: 'DOCUMENT', label: 'Document' }, { value: 'AUDIO', label: 'Audio' },
      ] },
      { name: 'category', label: 'Category', kind: 'text', required: true, maxLength: 80, placeholder: 'Photos, Videos, Publications, Press…' },
      imageField('media', 'Image or thumbnail'),
      { name: 'assetUrl', label: 'File (video, document or audio)', kind: 'asset', publicIdField: 'assetPublicId', uploadFolder: 'media', accept: 'video/*,audio/*,application/pdf', help: 'Not needed for images.' },
      { name: 'altText', label: 'Alt text', kind: 'text', maxLength: 300, help: 'Describe the image for people using assistive technology. Required to publish an image.' },
      { name: 'description', label: 'Description', kind: 'textarea', maxLength: 2000 },
      { name: 'dateLabel', label: 'Date label', kind: 'text', maxLength: 120 },
    ],
  },
  voices: {
    key: 'voices', label: 'Voices', singular: 'voice', kicker: 'Organisation', titleKey: 'name',
    lede: 'Hold quotations and perspectives for review. Confirm consent before anything is published.',
    columns: [{ key: 'role', label: 'Role' }, { key: 'quote', label: 'Quote' }],
    previewKey: 'imageUrl',
    fields: [
      { name: 'name', label: 'Name', kind: 'text', required: true, maxLength: 120 },
      { name: 'role', label: 'Role', kind: 'text', required: true, maxLength: 160 },
      { name: 'category', label: 'Category', kind: 'text', maxLength: 80, placeholder: 'Community leader, Partner…' },
      { name: 'quote', label: 'Quote', kind: 'textarea', required: true, maxLength: 600 },
      { name: 'description', label: 'About the speaker', kind: 'textarea', maxLength: 2000 },
      imageField('voices', 'Portrait'),
      { name: 'videoTitle', label: 'Video title', kind: 'text', maxLength: 160 },
      { name: 'videoUrl', label: 'Video', kind: 'asset', publicIdField: 'videoPublicId', uploadFolder: 'voices', accept: 'video/*' },
      { name: 'consentConfirmed', label: 'Consent confirmed', kind: 'boolean', required: true, help: 'The speaker agreed to this quote being published. Required to publish.' },
    ],
  },
  news: {
    key: 'news', label: 'News', singular: 'news article', kicker: 'Content', titleKey: 'title',
    lede: 'Write, review, and publish newsroom articles.',
    columns: [{ key: 'category', label: 'Category' }, { key: 'excerpt', label: 'Excerpt' }],
    previewKey: 'imageUrl',
    fields: [
      { name: 'title', label: 'Title', kind: 'text', required: true },
      { name: 'category', label: 'Category', kind: 'text', required: true, maxLength: 80, placeholder: 'Announcement, Youth, Policy and learning…' },
      { name: 'excerpt', label: 'Excerpt', kind: 'textarea', required: true, maxLength: 300 },
      imageField('news', 'Cover image'),
      { name: 'body', label: 'Body', kind: 'textarea', maxLength: 50000 },
      { name: 'dateLabel', label: 'Date label', kind: 'text', maxLength: 120 },
      { name: 'readLabel', label: 'Link label', kind: 'text', maxLength: 60, placeholder: 'Read perspective' },
    ],
  },
  programs: {
    key: 'programs', label: 'Programs', singular: 'program', kicker: 'Content', titleKey: 'title',
    lede: 'Track programme descriptions and the stage each one has reached.',
    columns: [{ key: 'stage', label: 'Stage' }, { key: 'summary', label: 'Summary' }],
    previewKey: 'imageUrl',
    fields: [
      { name: 'title', label: 'Title', kind: 'text', required: true },
      { name: 'summary', label: 'Summary', kind: 'text', required: true, maxLength: 300 },
      { name: 'stage', label: 'Stage', kind: 'select', required: true, options: [
        { value: 'CONCEPT', label: 'Concept' }, { value: 'PLANNING', label: 'Planning' },
        { value: 'ACTIVE', label: 'Active' }, { value: 'REVIEW', label: 'Review' }, { value: 'CLOSED', label: 'Closed' },
      ] },
      { name: 'featured', label: 'Featured', kind: 'boolean', required: true },
      { name: 'description', label: 'Description', kind: 'textarea', required: true, maxLength: 4000 },
      { name: 'detail', label: 'Detail', kind: 'textarea', maxLength: 10000 },
      imageField('programs'),
    ],
  },
  partners: {
    key: 'partners', label: 'Partners', singular: 'partner', kicker: 'Organisation', titleKey: 'name',
    lede: 'Maintain the partner directory shown on the public site.',
    columns: [{ key: 'type', label: 'Type' }, { key: 'website', label: 'Website' }],
    previewKey: 'logoUrl',
    fields: [
      { name: 'name', label: 'Name', kind: 'text', required: true },
      { name: 'type', label: 'Type', kind: 'select', required: true, options: [
        { value: 'INSTITUTIONAL', label: 'Institutional' }, { value: 'COMMUNITY', label: 'Community' },
        { value: 'FUNDER', label: 'Funder' }, { value: 'TECHNICAL', label: 'Technical' },
      ] },
      { name: 'description', label: 'Description', kind: 'textarea', maxLength: 2000 },
      { name: 'website', label: 'Website', kind: 'url', placeholder: 'https://example.org' },
      imageField('partners', 'Logo', 'logoUrl', 'logoPublicId'),
    ],
  },
};

/** Defaults for a new record (select/boolean fields need a valid starting value). */
export const newRecordDefaults: Partial<Record<ModuleKey, Record<string, string>>> = {
  events: { phase: 'UPCOMING' },
  media: { type: 'IMAGE' },
  voices: { consentConfirmed: 'false' },
  programs: { stage: 'CONCEPT', featured: 'false' },
  partners: { type: 'INSTITUTIONAL' },
};

/** Editorial workflow (enforced server-side in content.service.ts). */
export const statusTransitions: Record<ContentStatus, { to: ContentStatus; label: string }[]> = {
  DRAFT: [{ to: 'REVIEW', label: 'Submit for review' }, { to: 'PUBLISHED', label: 'Publish' }],
  REVIEW: [{ to: 'PUBLISHED', label: 'Publish' }, { to: 'DRAFT', label: 'Return to draft' }],
  PUBLISHED: [{ to: 'ARCHIVED', label: 'Archive' }, { to: 'DRAFT', label: 'Unpublish' }],
  ARCHIVED: [{ to: 'DRAFT', label: 'Restore as draft' }],
};

export const statusFilterOptions = [
  { value: 'all', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'REVIEW', label: 'In review' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' },
];
