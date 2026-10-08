import { ApiError } from "@/lib/api/api-error";
import { eventRepository, type EventRecord } from "@/Repositories/event.repository";
import type { EventCreateInput, EventUpdateInput } from "@/Schemas/event.schema";
import { createContentService } from "@/Services/content.service";
import { iso } from "@/Services/service-utils";

export interface EventDto {
  id: string;
  slug: string;
  status: EventRecord["status"];
  sortOrder: number;
  title: string;
  type: string;
  location: string;
  description: string;
  body: string | null;
  phase: EventRecord["phase"];
  dateLabel: string | null;
  startsAt: string | null;
  endsAt: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  contentNote: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const toEventDto = (r: EventRecord): EventDto => ({
  id: r.id,
  slug: r.slug,
  status: r.status,
  sortOrder: r.sortOrder,
  title: r.title,
  type: r.type,
  location: r.location,
  description: r.description,
  body: r.body,
  phase: r.phase,
  dateLabel: r.dateLabel,
  startsAt: iso(r.startsAt),
  endsAt: iso(r.endsAt),
  imageUrl: r.imageUrl,
  imagePublicId: r.imagePublicId,
  contentNote: r.contentNote,
  publishedAt: iso(r.publishedAt),
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
});

export const eventService = createContentService<EventRecord, EventCreateInput, EventUpdateInput, EventDto>({
  module: "events",
  entityType: "event",
  label: "Event",
  repository: eventRepository,
  toDto: toEventDto,
  titleOf: (r) => r.title,
  slugSource: (input) => input.title,
  validate: (r) => {
    if (r.startsAt && r.endsAt && r.endsAt < r.startsAt) {
      throw ApiError.validation(undefined, { endsAt: ["End must be after the start."] });
    }
  },
  publishProblems: (r) => (r.startsAt || r.dateLabel ? [] : ["Add a start date or a date label before publishing."]),
});
