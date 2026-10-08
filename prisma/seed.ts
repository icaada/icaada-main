/**
 * Seeds local/dev databases:
 *   1. One ADMIN and one EDITOR account (from env, or clearly fake defaults).
 *   2. The existing static site content (src/data/content.ts) as PUBLISHED
 *      records, so nothing is lost when pages move to the database.
 *   3. The single WorkspaceSettings row.
 *
 * Idempotent: users are matched by email and content by slug. Existing rows are
 * left untouched (never overwritten), so re-running never clobbers edits made
 * in the admin or a password someone has since changed.
 *
 * Run: pnpm db:seed   (or: pnpm prisma db seed)
 *
 * This script is the one deliberate exception to "only src/Repositories talks
 * to Prisma": it is an offline CLI tool that runs before the app exists.
 */
import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type EventPhase, type PartnerType } from "../src/generated/prisma/client";
import {
  events,
  leaderVideos,
  mediaItems,
  news,
  partnershipGroups,
  photos,
  stakeholderVoices,
  strategicPriorities,
  teamMembers,
} from "../src/data/content";
import { slugify } from "../src/lib/slug";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Set DIRECT_URL (or DATABASE_URL) before seeding. See .env.example.");
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const now = new Date();
const published = { status: "PUBLISHED" as const, publishedAt: now };

/** https://res.cloudinary.com/<cloud>/image/upload/v123/folder/name.jpg → "folder/name" */
function publicIdFromUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?$/i);
  return match ? match[1] : null;
}

const counts: Record<string, { created: number; existing: number }> = {};
async function upsertBySlug(
  model: string,
  find: () => Promise<{ id: string } | null>,
  create: () => Promise<{ id: string }>,
): Promise<string> {
  counts[model] ??= { created: 0, existing: 0 };
  const existing = await find();
  if (existing) {
    counts[model].existing++;
    return existing.id;
  }
  counts[model].created++;
  return (await create()).id;
}

// ─── Users ────────────────────────────────────────────────────────────────────

async function seedUsers() {
  const isProd = process.env.NODE_ENV === "production";
  const accounts = [
    {
      role: "ADMIN" as const,
      name: process.env.SEED_ADMIN_NAME ?? "Dev Admin",
      email: process.env.SEED_ADMIN_EMAIL ?? "admin@example.org",
      password: process.env.SEED_ADMIN_PASSWORD ?? "dev-admin-password-123",
      roleTitle: "Administrator",
    },
    {
      role: "EDITOR" as const,
      name: process.env.SEED_EDITOR_NAME ?? "Dev Editor",
      email: process.env.SEED_EDITOR_EMAIL ?? "editor@example.org",
      password: process.env.SEED_EDITOR_PASSWORD ?? "dev-editor-password-123",
      roleTitle: "Content editor",
    },
  ];

  for (const account of accounts) {
    const usingDefaults = account.email.endsWith("@example.org");
    if (isProd && usingDefaults) {
      throw new Error(`Refusing to seed the fake ${account.role} account in production. Set SEED_${account.role}_EMAIL/PASSWORD.`);
    }
    const email = account.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`  user ${email} already exists (left unchanged)`);
      continue;
    }
    await prisma.user.create({
      data: {
        name: account.name,
        email,
        role: account.role,
        roleTitle: account.roleTitle,
        passwordHash: await bcrypt.hash(account.password, 12),
      },
    });
    console.log(`  created ${account.role} ${email}${usingDefaults ? ` (dev password: ${account.password})` : ""}`);
  }
}

// ─── Content (src/data/content.ts → PUBLISHED rows) ──────────────────────────

const eventPhase: Record<string, EventPhase> = {
  Envisioned: "ENVISIONED",
  Upcoming: "UPCOMING",
  Ongoing: "ONGOING",
  Past: "PAST",
};

// partnershipGroups are stakeholder categories; this maps each to the closest
// admin partner type. Review in the admin after seeding.
const partnerType = (name: string): PartnerType => {
  if (/private-sector|foundations|philanthropic/i.test(name)) return "FUNDER";
  if (/media|technology/i.test(name)) return "TECHNICAL";
  if (/ngos|community-based|youth and women/i.test(name)) return "COMMUNITY";
  return "INSTITUTIONAL";
};

async function seedContent() {
  // Team members
  for (const [index, member] of teamMembers.entries()) {
    const slug = slugify(member.name);
    await upsertBySlug("teamMember", () => prisma.teamMember.findUnique({ where: { slug } }), () =>
      prisma.teamMember.create({
        data: {
          ...published,
          slug,
          sortOrder: index,
          name: member.name.trim(),
          position: member.position,
          biography: member.biography,
          imageUrl: member.image,
          imagePublicId: publicIdFromUrl(member.image),
          responsibilities: member.responsibilities.map((item) => item.trim()),
          expertise: member.expertise,
          email: member.email ?? null,
          phone: member.phone ?? null,
          location: member.location ?? null,
          socialLinks: member.socialLinks,
        },
      }),
    );
  }

  // Events (pages currently pick a stock photo per event; keep that visual)
  const eventIds = new Map<string, string>();
  for (const [index, event] of events.entries()) {
    const image = event.status === "Envisioned" ? photos.meeting : photos.workshop;
    const id = await upsertBySlug("event", () => prisma.event.findUnique({ where: { slug: event.slug } }), () =>
      prisma.event.create({
        data: {
          ...published,
          slug: event.slug,
          sortOrder: index,
          title: event.title,
          type: event.type,
          location: event.location,
          description: event.description,
          phase: eventPhase[event.status] ?? "UPCOMING",
          dateLabel: event.dateLabel,
          contentNote: event.contentStatus,
          imageUrl: image,
          imagePublicId: publicIdFromUrl(image),
        },
      }),
    );
    eventIds.set(event.slug, id);
  }

  // News
  for (const [index, post] of news.entries()) {
    await upsertBySlug("newsPost", () => prisma.newsPost.findUnique({ where: { slug: post.slug } }), () =>
      prisma.newsPost.create({
        data: {
          ...published,
          // Preserve the current listing order (newest first = first in content.ts).
          publishedAt: new Date(now.getTime() - index * 60_000),
          slug: post.slug,
          sortOrder: index,
          title: post.title,
          category: post.category,
          excerpt: post.excerpt,
          dateLabel: post.date,
          readLabel: post.read,
          imageUrl: post.image,
          imagePublicId: publicIdFromUrl(post.image),
        },
      }),
    );
  }

  // Voices = stakeholderVoices + their leaderVideos (joined by videoId/voiceId)
  const voiceIds = new Map<string, string>();
  for (const [index, voice] of stakeholderVoices.entries()) {
    const slug = slugify(voice.name);
    const video = leaderVideos.find((item) => item.id === voice.videoId || item.voiceId === voice.id);
    const id = await upsertBySlug("voice", () => prisma.voice.findUnique({ where: { slug } }), () =>
      prisma.voice.create({
        data: {
          ...published,
          slug,
          sortOrder: index,
          name: voice.name,
          role: voice.role,
          category: voice.category,
          quote: voice.quote,
          description: voice.description,
          imageUrl: voice.image,
          imagePublicId: publicIdFromUrl(voice.image),
          videoTitle: video?.title ?? null,
          videoUrl: video?.videoUrl ?? null,
          videoPublicId: publicIdFromUrl(video?.videoUrl),
          videoPosterUrl: video?.image ?? null,
          // Already public on the live site.
          consentConfirmed: true,
          eventId: eventIds.get(voice.eventSlug) ?? null,
        },
      }),
    );
    voiceIds.set(voice.id, id);
  }

  // Media
  for (const [index, item] of mediaItems.entries()) {
    const slug = slugify(`${item.category}-${item.title}`);
    await upsertBySlug("mediaItem", () => prisma.mediaItem.findUnique({ where: { slug } }), () =>
      prisma.mediaItem.create({
        data: {
          ...published,
          slug,
          sortOrder: index,
          title: item.title,
          type: "video" in item && item.video ? "VIDEO" : "IMAGE",
          category: item.category,
          description: item.description,
          altText: item.title,
          dateLabel: item.date,
          imageUrl: item.image,
          imagePublicId: publicIdFromUrl(item.image),
          voiceId: "voiceId" in item && item.voiceId ? (voiceIds.get(item.voiceId) ?? null) : null,
        },
      }),
    );
  }

  // Programs = strategic priorities
  for (const [index, priority] of strategicPriorities.entries()) {
    await upsertBySlug("program", () => prisma.program.findUnique({ where: { slug: priority.anchor } }), () =>
      prisma.program.create({
        data: {
          ...published,
          slug: priority.anchor,
          sortOrder: index,
          title: priority.title,
          summary: priority.short,
          description: priority.description,
          detail: priority.detail,
          stage: "ACTIVE",
          featured: priority.featured ?? false,
          imageUrl: priority.image,
          imagePublicId: publicIdFromUrl(priority.image),
        },
      }),
    );
  }

  // Partners = partnership groups
  for (const [index, name] of partnershipGroups.entries()) {
    const slug = slugify(name);
    await upsertBySlug("partner", () => prisma.partner.findUnique({ where: { slug } }), () =>
      prisma.partner.create({
        data: { ...published, slug, sortOrder: index, name, type: partnerType(name) },
      }),
    );
  }
}

async function seedSettings() {
  await prisma.workspaceSettings.upsert({
    where: { id: "workspace" },
    create: { id: "workspace", workspaceName: "ICAADA", contactEmail: "hello@icaada.org", timezone: "Africa/Lagos", language: "English" },
    update: {},
  });
}

async function main() {
  console.log("Seeding users…");
  await seedUsers();
  console.log("Seeding content from src/data/content.ts…");
  await seedContent();
  for (const [model, { created, existing }] of Object.entries(counts)) {
    console.log(`  ${model.padEnd(11)} created ${created}, already present ${existing}`);
  }
  await seedSettings();
  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
