"use client";

import { useState } from "react";
import { ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { useGroups } from "@/hooks/useGroups";
import { Skeleton } from "@/components/ui/skeleton";
import { GroupCard } from "@/components/groups/GroupCard";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";

export default function GroupsPage() {
  const { data: groups, isLoading } = useGroups();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="animate-fade-slide-in pt-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-h1">Groups</h1>
        <Button onClick={() => setCreateOpen(true)}>New group</Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      )}

      {!isLoading && (groups?.length ?? 0) === 0 && (
        <EmptyState
          icon={ListMusic}
          title="Create your first group"
          description="Group tracks into playlists or albums to organize your library."
          actionLabel="New group"
          onAction={() => setCreateOpen(true)}
        />
      )}

      {!isLoading && (groups?.length ?? 0) > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {groups!.map((group) => (
            <GroupCard key={group._id} group={group} />
          ))}
        </div>
      )}

      <CreateGroupDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
