"use client";

import { useState } from "react";
import { Disc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlbums } from "@/hooks/useAlbums";
import { useAuth } from "@/hooks/useAuth";
import { AlbumCard } from "@/components/albums/AlbumCard";
import { CreateAlbumDialog } from "@/components/albums/CreateAlbumDialog";

export default function AlbumsPage() {
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");

  const { data: albumsData, isLoading } = useAlbums({
    search: search || undefined,
    genre: genre || undefined,
  });

  const isAdmin = !!user?.isAdmin;

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
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Input
          placeholder="Filter by genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      )}

      {!isLoading && (albumsData?.data.length ?? 0) === 0 && !search && !genre && (
        <EmptyState
          icon={Disc}
          title="Create your first album"
          description="Albums let you organize your tracks with rich metadata like artist, year, and genre."
          actionLabel="New album"
          onAction={() => setCreateOpen(true)}
        />
      )}

      {!isLoading && (albumsData?.data.length ?? 0) === 0 && (search || genre) && (
        <EmptyState
          icon={Disc}
          title="No albums found"
          description="Try adjusting your search or filters."
        />
      )}

      {!isLoading && (albumsData?.data.length ?? 0) > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {albumsData!.data.map((album) => (
            <AlbumCard key={album._id} album={album} />
          ))}
        </div>
      )}

      <CreateAlbumDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
