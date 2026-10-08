import { voiceRepository, type VoiceRecord } from "@/Repositories/voice.repository";
import type { VoiceCreateInput, VoiceUpdateInput } from "@/Schemas/voice.schema";
import { createContentService } from "@/Services/content.service";
import { iso } from "@/Services/service-utils";

export interface VoiceDto {
  id: string;
  slug: string;
  status: VoiceRecord["status"];
  sortOrder: number;
  name: string;
  role: string;
  category: string | null;
  quote: string;
  description: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  videoTitle: string | null;
  videoUrl: string | null;
  videoPublicId: string | null;
  videoPosterUrl: string | null;
  consentConfirmed: boolean;
  eventId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const toVoiceDto = (r: VoiceRecord): VoiceDto => ({
  id: r.id,
  slug: r.slug,
  status: r.status,
  sortOrder: r.sortOrder,
  name: r.name,
  role: r.role,
  category: r.category,
  quote: r.quote,
  description: r.description,
  imageUrl: r.imageUrl,
  imagePublicId: r.imagePublicId,
  videoTitle: r.videoTitle,
  videoUrl: r.videoUrl,
  videoPublicId: r.videoPublicId,
  videoPosterUrl: r.videoPosterUrl,
  consentConfirmed: r.consentConfirmed,
  eventId: r.eventId,
  publishedAt: iso(r.publishedAt),
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
});

export const voiceService = createContentService<VoiceRecord, VoiceCreateInput, VoiceUpdateInput, VoiceDto>({
  module: "voices",
  entityType: "voice",
  label: "Voice",
  repository: voiceRepository,
  toDto: toVoiceDto,
  titleOf: (r) => r.name,
  slugSource: (input) => input.name,
  // Quotes attributed to real people need recorded consent before going public.
  publishProblems: (r) => (r.consentConfirmed ? [] : ["Confirm consent from the speaker before publishing."]),
});
