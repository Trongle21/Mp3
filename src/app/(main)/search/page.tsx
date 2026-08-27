"use client";

import { useEffect, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useTracks } from "@/hooks/useTracks";
import { useGroups } from "@/hooks/useGroups";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { TrackList } from "@/components/tracks/TrackList";
import { GroupCard } from "@/components/groups/GroupCard";

const RECENT_KEY = "recentSearches";
const MAX_RECENT = 8;

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecent(term: string) {
  const existing = loadRecent().filter((t) => t !== term);
  const updated = [term, ...existing].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  return updated;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => setRecent(loadRecent()), []);

  useEffect(() => {
    if (debouncedQuery.trim().length > 1) {
      setRecent(saveRecent(debouncedQuery.trim()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const { data: trackData, isLoading: tracksLoading } = useTracks({
    search: debouncedQuery || undefined,
  });
  const { data: groups, isLoading: groupsLoading } = useGroups();

  const tracks = trackData?.data ?? [];
  const matchedGroups = (groups ?? []).filter((g) =>
    g.name.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  const isSearching = debouncedQuery.trim().length > 0;
  const isLoading = tracksLoading || groupsLoading;
  const hasResults = tracks.length > 0 || matchedGroups.length > 0;

  return (
    <div className="animate-fade-slide-in pt-4">
      <div className="relative mx-auto max-w-lg">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input
          autoFocus
          placeholder="Search tracks, artists, groups"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 pl-9"
        />
      </div>

      {!isSearching && (
        <div className="mx-auto mt-8 max-w-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-h3 text-text-primary">Recent searches</h2>
            {recent.length > 0 && (
              <button
                onClick={() => {
                  localStorage.removeItem(RECENT_KEY);
                  setRecent([]);
                }}
                className="text-caption text-text-muted hover:text-text-primary"
              >
                Clear
              </button>
            )}
          </div>
          {recent.length === 0 ? (
            <p className="mt-3 text-caption text-text-muted">Your recent searches will show up here.</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {recent.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="flex items-center gap-1 rounded-full border border-border bg-bg-elevated px-3 py-1.5 text-caption text-text-secondary hover:text-text-primary"
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {isSearching && isLoading && (
        <div className="mt-8 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {isSearching && !isLoading && !hasResults && (
        <EmptyState
          icon={SearchIcon}
          title="No results"
          description={`Nothing matches "${debouncedQuery}". Try a different search.`}
        />
      )}

      {isSearching && !isLoading && hasResults && (
        <div className="mt-8 space-y-8">
          {matchedGroups.length > 0 && (
            <section>
              <h2 className="mb-3 text-h3 text-text-primary">Groups</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {matchedGroups.map((group) => (
                  <GroupCard key={group._id} group={group} />
                ))}
              </div>
            </section>
          )}
          {tracks.length > 0 && (
            <section>
              <h2 className="mb-3 text-h3 text-text-primary">Tracks</h2>
              <TrackList tracks={tracks} />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
