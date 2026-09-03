import { useEffect, useState } from 'react';

import { useDebounce } from '@/lib';
import { useGetGroupListQuery, useGetTrackListQuery } from '@/services';

export const RECENT_KEY = 'recentSearches';

const MAX_RECENT = 8;

function loadRecent(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveRecent(term: string) {
  const existing = loadRecent().filter(t => t !== term);
  const updated = [term, ...existing].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  return updated;
}

export const useSearchPage = () => {
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>([]);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim().length > 1) {
      setRecent(saveRecent(debouncedQuery.trim()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const { data: trackData, isLoading: tracksLoading } = useGetTrackListQuery({
    search: debouncedQuery || undefined,
  });

  const { data: groups, isLoading: groupsLoading } = useGetGroupListQuery();

  const tracks = trackData?.data ?? [];

  const matchedGroups = (groups ?? []).filter(g =>
    g.name.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  const isSearching = debouncedQuery.trim().length > 0;
  const isLoading = tracksLoading || groupsLoading;
  const hasResults = tracks.length > 0 || matchedGroups.length > 0;

  return {
    debouncedQuery,
    query,
    setQuery,
    recent,
    setRecent,
    isSearching,
    isLoading,
    hasResults,
    matchedGroups,
    tracks,
  };
};
