'use client';

import { EmptyState } from '@/components/shared/EmptyState';
import { TrackList } from '@/components/tracks/TrackList';
import { TrackSkeleton } from '@/components/tracks/TrackSkeleton';
import { UploadModal } from '@/components/tracks/UploadModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLibrary, type SortOption } from '@/hooks';
import { Search, Upload } from 'lucide-react';

const sortLabels: Record<SortOption, string> = {
  recent: 'Recent',
  title_asc: 'Title A–Z',
  artist_asc: 'Artist A–Z',
};

export default function LibraryPage() {
  const {
    user,
    setUploadOpen,
    search,
    setSearch,
    sort,
    setSort,
    isLoading,
    tracks,
    debouncedSearch,
    uploadOpen,
  } = useLibrary();

  return (
    <div className="animate-fade-slide-in pt-4">
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
        <h1 className="text-h2 sm:text-h1">Your Library</h1>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Search your library"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortOption)}
          className="h-11 shrink-0 rounded-md border border-border bg-bg-elevated px-3 text-body text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:w-auto"
        >
          {Object.entries(sortLabels).map(([value, label]) => (
            <option
              key={value}
              value={value}
            >
              {label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="space-y-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <TrackSkeleton key={i} />
          ))}
        </div>
      )}

      {!isLoading && tracks.length === 0 && (
        <EmptyState
          icon={Upload}
          title={
            debouncedSearch ? 'No tracks found' : 'Upload your first track'
          }
          description={
            debouncedSearch
              ? 'Try a different search term.'
              : 'Your library is empty. Add a track to start listening.'
          }
          actionLabel={debouncedSearch ? undefined : 'Upload track'}
          onAction={debouncedSearch ? undefined : () => setUploadOpen(true)}
        />
      )}

      {!isLoading && tracks.length > 0 && (
        <TrackList
          tracks={tracks}
          isAdmin={!!user?.isAdmin}
        />
      )}

      <UploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
      />
    </div>
  );
}
