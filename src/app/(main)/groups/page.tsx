'use client';

import { CreateGroupDialog } from '@/components/groups/CreateGroupDialog';
import { GroupCard } from '@/components/groups/GroupCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useGroup } from '@/hooks';
import { ListMusic } from 'lucide-react';

export default function GroupsPage() {
  const { user } = useAuth();
  const isAdmin = !!user?.isAdmin;

  const {
    createOpen,
    setCreateOpen,
    search,
    setSearch,
    groupsData,
    isLoading,
  } = useGroup();

  return (
    <div className="animate-fade-slide-in pt-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-h1">Groups</h1>
        <Button onClick={() => setCreateOpen(true)}>New group</Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Search groups..."
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

      {!isLoading && (groupsData?.length ?? 0) === 0 && !search && (
        <EmptyState
          icon={ListMusic}
          title="Create your first group"
          description="Groups let you bundle tracks into a single ordered collection."
          actionLabel="New group"
          onAction={() => setCreateOpen(true)}
        />
      )}

      {!isLoading && (groupsData?.length ?? 0) === 0 && search && (
        <EmptyState
          icon={ListMusic}
          title="No groups found"
          description="Try adjusting your search or filters."
        />
      )}

      {!isLoading && (groupsData?.length ?? 0) > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {groupsData?.map(group => (
            <GroupCard
              key={group._id}
              group={group}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      <CreateGroupDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}
