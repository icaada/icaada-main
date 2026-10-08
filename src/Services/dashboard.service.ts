import { contactMessageRepository } from "@/Repositories/contact-message.repository";
import { subscriberRepository } from "@/Repositories/subscriber.repository";
import { volunteerRepository } from "@/Repositories/volunteer.repository";
import type { ContentModule } from "@/lib/cache";
import type { ContentStatus } from "@/Schemas/common.schema";
import type { ContentService } from "@/Services/content.service";
import { eventService } from "@/Services/event.service";
import { mediaService } from "@/Services/media.service";
import { newsService } from "@/Services/news.service";
import { partnerService } from "@/Services/partner.service";
import { programService } from "@/Services/program.service";
import { teamMemberService } from "@/Services/team-member.service";
import { voiceService } from "@/Services/voice.service";

export type StatusCounts = Record<ContentStatus, number> & { total: number };

export interface AdminSummaryDto {
  content: Record<ContentModule, StatusCounts>;
  /** REVIEW items across every content module. */
  inReview: number;
  /** PUBLISHED items across every content module. */
  published: number;
  unreadMessages: number;
  newVolunteers: number;
  activeSubscribers: number;
}

const contentServices: Record<ContentModule, ContentService<never, never, unknown>> = {
  team: teamMemberService,
  events: eventService,
  media: mediaService,
  voices: voiceService,
  news: newsService,
  programs: programService,
  partners: partnerService,
};

export const dashboardService = {
  /** Counts for the dashboard cards and the admin header badges. */
  async summary(): Promise<AdminSummaryDto> {
    const modules = Object.keys(contentServices) as ContentModule[];
    const [counts, unreadMessages, newVolunteers, activeSubscribers] = await Promise.all([
      Promise.all(modules.map((m) => contentServices[m].statusCounts())),
      contactMessageRepository.countByStatus("NEW"),
      volunteerRepository.countByStatus("NEW"),
      subscriberRepository.countByStatus("SUBSCRIBED"),
    ]);
    const content = Object.fromEntries(
      modules.map((m, i) => {
        const c = counts[i];
        return [m, { ...c, total: c.DRAFT + c.REVIEW + c.PUBLISHED + c.ARCHIVED }];
      }),
    ) as Record<ContentModule, StatusCounts>;
    const sum = (status: ContentStatus) => modules.reduce((n, m) => n + content[m][status], 0);
    return { content, inReview: sum("REVIEW"), published: sum("PUBLISHED"), unreadMessages, newVolunteers, activeSubscribers };
  },
};
