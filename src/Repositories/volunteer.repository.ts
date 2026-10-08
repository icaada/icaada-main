import type { Prisma, VolunteerApplication } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import type { VolunteerStatus } from "@/Schemas/volunteer.schema";
import { ci, withPrismaErrors, type ListParams, type Paged } from "@/Repositories/repository-utils";

export type VolunteerRecord = VolunteerApplication;

export interface VolunteerCreateData {
  name: string;
  email: string;
  phone: string | null;
  state: string;
  lga: string | null;
  interests: string[];
  availability: string | null;
  message: string | null;
}

export const volunteerRepository = {
  create(data: VolunteerCreateData) {
    return getPrisma().volunteerApplication.create({ data });
  },

  async list({ search, status, skip, take }: ListParams & { status?: VolunteerStatus }): Promise<Paged<VolunteerApplication>> {
    const where: Prisma.VolunteerApplicationWhereInput = {
      ...(status ? { status } : {}),
      ...(search
        ? { OR: [{ name: ci(search) }, { email: ci(search) }, { state: ci(search) }, { lga: ci(search) }] }
        : {}),
    };
    const [items, total] = await getPrisma().$transaction([
      getPrisma().volunteerApplication.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
      getPrisma().volunteerApplication.count({ where }),
    ]);
    return { items, total };
  },

  countByStatus(status: VolunteerStatus) {
    return getPrisma().volunteerApplication.count({ where: { status } });
  },

  findById(id: string) {
    return getPrisma().volunteerApplication.findUnique({ where: { id } });
  },

  update(id: string, data: { status: VolunteerStatus }) {
    return withPrismaErrors(() => getPrisma().volunteerApplication.update({ where: { id }, data }));
  },

  delete(id: string) {
    return withPrismaErrors(() => getPrisma().volunteerApplication.delete({ where: { id } }));
  },
};
