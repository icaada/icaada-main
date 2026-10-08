'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { adminApi, errorMessage, withQuery } from '@/lib/admin/api-client';

export interface ListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  [extra: string]: unknown;
}

const SEARCH_DEBOUNCE_MS = 250;

/**
 * Server-side list for an admin collection endpoint: search (debounced),
 * status filter and "load more" pagination, plus local helpers to reflect a
 * mutation without refetching.
 */
export function useAdminList<T extends { id: string }>(
  path: string,
  { search = '', status, pageSize = 50 }: { search?: string; status?: string; pageSize?: number } = {},
) {
  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState(search.trim());
  const [version, setVersion] = useState(0);
  const requestId = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [search]);

  const fetchPage = useCallback(
    (page: number) => adminApi.get<T[], ListMeta>(withQuery(path, { search: debouncedSearch, status, page, pageSize })),
    [path, debouncedSearch, status, pageSize],
  );

  useEffect(() => {
    const id = ++requestId.current;
    fetchPage(1)
      .then(({ data, meta: nextMeta }) => {
        if (id !== requestId.current) return;
        setItems(data);
        setMeta(nextMeta ?? null);
        setError(null);
      })
      .catch((err) => {
        if (id === requestId.current) setError(errorMessage(err));
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
  }, [fetchPage, version]);

  const loadMore = useCallback(async () => {
    if (!meta || meta.page >= meta.totalPages) return;
    const id = requestId.current;
    try {
      const { data, meta: nextMeta } = await fetchPage(meta.page + 1);
      if (id !== requestId.current) return;
      setItems((current) => [...current, ...data.filter((item) => !current.some((c) => c.id === item.id))]);
      setMeta(nextMeta ?? null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [fetchPage, meta]);

  return {
    items,
    meta,
    loading,
    error,
    hasMore: Boolean(meta && meta.page < meta.totalPages),
    loadMore,
    reload: () => setVersion((v) => v + 1),
    replaceItem: (item: T) => setItems((current) => current.map((c) => (c.id === item.id ? item : c))),
    removeItem: (id: string) => {
      setItems((current) => current.filter((c) => c.id !== id));
      setMeta((current) => (current ? { ...current, total: Math.max(0, current.total - 1) } : current));
    },
  };
}
