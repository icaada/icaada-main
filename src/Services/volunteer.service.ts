import { ApiError } from "@/lib/api/api-error";
import { notifier } from "@/lib/notifier";
import { enforceRateLimit, rateLimits } from "@/lib/rate-limit";
import { volunteerRepository, type VolunteerRecord } from "@/Repositories/volunteer.repository";
import { HONEYPOT_FIELD } from "@/Schemas/common.schema";
import type { VolunteerListQuery, VolunteerSubmitInput, VolunteerUpdateInput } from "@/Schemas/volunteer.schema";
import { activityService } from "@/Services/activity.service";
import { pageArgs, pageMeta, type Actor } from "@/Services/service-utils";

export interface VolunteerDto {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  state: string;
  lga: string | null;
  interests: string[];
  availability: string | null;
  message: string | null;
  status: VolunteerRecord["status"];
  createdAt: string;
  updatedAt: string;
}

const toDto = (v: VolunteerRecord): VolunteerDto => ({
  id: v.id,
  name: v.name,
  email: v.email,
  phone: v.phone,
  state: v.state,
  lga: v.lga,
  interests: v.interests,
  availability: v.availability,
  message: v.message,
  status: v.status,
  createdAt: v.createdAt.toISOString(),
  updatedAt: v.updatedAt.toISOString(),
});

const getApplication = async (id: string) => {
  const application = await volunteerRepository.findById(id);
  if (!application) throw ApiError.notFound("Volunteer application not found.");
  return application;
};

export const volunteerService = {
  /** Public volunteer form. Honeypot hits are acknowledged but silently dropped. */
  async submit(input: VolunteerSubmitInput, clientIp: string): Promise<void> {
    enforceRateLimit(`volunteer:${clientIp}`, rateLimits.volunteer);
    if (input[HONEYPOT_FIELD]) return;

    const application = await volunteerRepository.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      state: input.state,
      lga: input.lga,
      interests: input.interests,
      availability: input.availability,
      message: input.message,
    });
    await activityService.record(null, "received", "volunteer", application.id, `New volunteer application from ${application.name} (${application.state})`);
    await notifier.notify({ type: "volunteer.received", id: application.id, name: application.name, email: application.email, state: application.state });
  },

  async list(query: VolunteerListQuery) {
    const { items, total } = await volunteerRepository.list({ search: query.search, status: query.status, ...pageArgs(query) });
    return { items: items.map(toDto), meta: pageMeta(query, total) };
  },

  async get(id: string) {
    return toDto(await getApplication(id));
  },

  async update(actor: Actor, id: string, input: VolunteerUpdateInput) {
    await getApplication(id);
    const application = await volunteerRepository.update(id, { status: input.status });
    await activityService.record(actor, `status.${input.status.toLowerCase()}`, "volunteer", id, `Marked ${application.name}'s application ${input.status.toLowerCase()}`);
    return toDto(application);
  },

  async remove(actor: Actor, id: string) {
    const existing = await getApplication(id);
    await volunteerRepository.delete(id);
    await activityService.record(actor, "deleted", "volunteer", id, `Deleted volunteer application from ${existing.name}`);
  },
};
