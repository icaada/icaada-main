import type { PageMeta } from "@/lib/api/response";
import type { Role } from "@/Schemas/common.schema";

/** The authenticated user performing an action (provided by the auth guard). */
export interface Actor {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** The Session row behind this request (absent for system/background actors). */
  sessionId?: string;
}

export function pageArgs(query: { page: number; pageSize: number }) {
  return { skip: (query.page - 1) * query.pageSize, take: query.pageSize };
}

export function pageMeta(query: { page: number; pageSize: number }, total: number): PageMeta {
  return {
    page: query.page,
    pageSize: query.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export const iso = (date: Date | null | undefined) => (date ? date.toISOString() : null);
