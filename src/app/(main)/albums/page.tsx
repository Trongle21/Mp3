'use client';

import { AlbumCard } from '@/components/albums/AlbumCard';
import { CreateAlbumDialog } from '@/components/albums/CreateAlbumDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAlbum } from '@/hooks';
import { Disc } from 'lucide-react';

export default function AlbumsPage() {
  const {
    createOpen,
    setCreateOpen,
    search,
    setSearch,
    albumsData,
    isLoading,
  } = useAlbum();

  return (
    <div className="animate-fade-slide-in pt-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-h1">Albums</h1>
        <Button onClick={() => setCreateOpen(true)}>New album</Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Search albums..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className="aspect-square w-full"
            />
          ))}
        </div>
      )}

      {!isLoading && (albumsData?.length ?? 0) === 0 && !search && (
        <EmptyState
          icon={Disc}
          title="Create your first album"
          description="Albums let you organize your tracks with rich metadata like artist and year."
          actionLabel="New album"
          onAction={() => setCreateOpen(true)}
        />
      )}

      {!isLoading && (albumsData?.length ?? 0) === 0 && search && (
        <EmptyState
          icon={Disc}
          title="No albums found"
          description="Try adjusting your search or filters."
        />
      )}

      {!isLoading && (albumsData?.length ?? 0) > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {albumsData?.map(album => (
            <AlbumCard
              key={album._id}
              album={album}
            />
          ))}
        </div>
      )}

      <CreateAlbumDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}
