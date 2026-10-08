import type { Prisma, Subscriber } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import type { SubscriberStatus } from "@/Schemas/newsletter.schema";
import { ci, defined, withPrismaErrors, type ListParams, type Paged } from "@/Repositories/repository-utils";

export type SubscriberRecord = Subscriber;

export const subscriberRepository = {
  findByEmail(email: string) {
    return getPrisma().subscriber.findUnique({ where: { email } });
  },

  findById(id: string) {
    return getPrisma().subscriber.findUnique({ where: { id } });
  },

  /** Creates or re-subscribes; idempotent per email. */
  upsertSubscribed(email: string, name: string | null) {
    return getPrisma().subscriber.upsert({
      where: { email },
      create: { email, name },
      update: { status: "SUBSCRIBED", subscribedAt: new Date(), unsubscribedAt: null, ...(name ? { name } : {}) },
    });
  },

  async list({ search, status, skip, take }: ListParams & { status?: SubscriberStatus }): Promise<Paged<Subscriber>> {
    const where: Prisma.SubscriberWhereInput = {
      ...(status ? { status } : {}),
      ...(search ? { OR: [{ email: ci(search) }, { name: ci(search) }] } : {}),
    };
    const [items, total] = await getPrisma().$transaction([
      getPrisma().subscriber.findMany({ where, orderBy: { subscribedAt: "desc" }, skip, take }),
      getPrisma().subscriber.count({ where }),
    ]);
    return { items, total };
  },

  countByStatus(status: SubscriberStatus) {
    return getPrisma().subscriber.count({ where: { status } });
  },

  update(id: string, data: { status?: SubscriberStatus; name?: string | null; unsubscribedAt?: Date | null; subscribedAt?: Date }) {
    return withPrismaErrors(() => getPrisma().subscriber.update({ where: { id }, data: defined(data) }));
  },

  delete(id: string) {
    return withPrismaErrors(() => getPrisma().subscriber.delete({ where: { id } }));
  },
};
