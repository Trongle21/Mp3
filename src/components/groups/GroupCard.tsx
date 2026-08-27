"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Play, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Group } from "@/interfaces/group.interface";
import { coverUrl, coverInitial } from "@/lib/utils";
import { usePlayer } from "@/hooks/usePlayer";
import { useDeleteGroupInline } from "@/hooks/useGroups";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { RenameGroupDialog } from "./RenameGroupDialog";

export function GroupCard({ group }: { group: Group }) {
  const { setQueue, play } = usePlayer();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const deleteGroup = useDeleteGroupInline();

  const covers = group?.tracks?.slice(0, 4).map((t) => t.track);
  const hasThumbnail = !!group?.thumbnailUrl;

  const playAll = () => {
    if (covers?.length === 0 && group?.tracks?.length === 0) return;
    const tracks = group?.tracks?.map((t) => t.track);
    setQueue(tracks);
    play(tracks?.[0]);
  };

  return (
    <>
      <div className="group relative rounded-lg p-3 transition-colors hover:bg-bg-elevated">
        <Link href={`/groups/${group._id}`}>
          <div className="relative aspect-square overflow-hidden rounded-md bg-bg-highlight">
            {hasThumbnail ? (
              <Image
                src={group.thumbnailUrl!}
                alt={group.name}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
            ) : covers?.length > 0 ? (
              <div className="grid h-full w-full grid-cols-2 grid-rows-2">
                {covers.map((track, i) => (
                  <div key={i} className="relative">
                    {track?.coverKey ? (
                      <Image
                        src={coverUrl(track.coverKey)}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 13vw, (min-width: 640px) 17vw, 25vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-bg-highlight to-bg-elevated text-text-muted">
                        <span className="text-2xl font-semibold text-text-secondary">
                          {coverInitial(track?.title)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-bg-highlight to-bg-elevated text-text-muted">
                <span className="text-3xl font-semibold text-text-secondary">
                  {coverInitial(group?.name)}
                </span>
              </div>
            )}
          </div>
          <p className="mt-3 truncate text-body font-medium text-text-primary">
            {group?.name}
          </p>
          <p className="text-caption text-text-secondary">
            {group?.trackCount} tracks
          </p>
        </Link>

        <button
          onClick={(e) => {
            e.preventDefault();
            playAll();
          }}
          aria-label={`Play ${group?.name}`}
          className="absolute bottom-16 right-5 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-accent text-black opacity-0 shadow-lg transition-all hover:scale-105 hover:bg-accent-hover group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Play className="ml-0.5 h-4 w-4" />
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            setMenuOpen((v) => !v);
          }}
          aria-label="Group options"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-bg-primary/70 text-text-secondary opacity-0 transition-opacity hover:text-text-primary group-hover:opacity-100"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-3 top-11 z-10 w-40 rounded-lg border border-border bg-bg-elevated py-1 shadow-xl">
            <button
              onClick={() => {
                setShowRename(true);
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-caption text-text-primary hover:bg-bg-highlight"
            >
              <Pencil className="h-3.5 w-3.5" />
              Rename
            </button>
            <button
              onClick={() => {
                setShowDelete(true);
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-caption text-danger hover:bg-bg-highlight"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>

      <RenameGroupDialog
        open={showRename}
        onOpenChange={setShowRename}
        group={group}
      />

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete group"
        description={`"${group?.name}" will be deleted. Tracks stay in your library.`}
        confirmLabel="Delete"
        onConfirm={() =>
          deleteGroup.mutate(group._id, {
            onSuccess: () => toast.success("Group deleted"),
            onError: () => toast.error("Couldn't delete group"),
          })
        }
      />
    </>
  );
}
