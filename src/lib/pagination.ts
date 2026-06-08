import { z } from 'zod';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export type Pagination = z.infer<typeof paginationQuerySchema>;

export interface PageMeta {
  total: number;
  page: number;
  pageSize: number;
}

export function toSkipTake({ page, pageSize }: Pagination): { skip: number; take: number } {
  return { skip: (page - 1) * pageSize, take: pageSize };
}

export function buildMeta(total: number, { page, pageSize }: Pagination): PageMeta {
  return { total, page, pageSize };
}

export function paginated<T>(data: T[], total: number, pagination: Pagination) {
  return { data, meta: buildMeta(total, pagination) };
}
