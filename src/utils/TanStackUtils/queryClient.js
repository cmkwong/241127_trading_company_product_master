import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const QUERY_CACHE_STORAGE_KEY = 'trade_business_query_cache';

const DAY_MS = 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Serve cached data instantly while a background revalidation runs.
      staleTime: 60 * 1000,
      gcTime: DAY_MS,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

export const queryPersister = createSyncStoragePersister({
  storage: {
    getItem: (key) => {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: (key, value) => {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Ignore storage failures (quota / private browsing).
      }
    },
    removeItem: (key) => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Ignore storage failures.
      }
    },
  },
  key: QUERY_CACHE_STORAGE_KEY,
});
