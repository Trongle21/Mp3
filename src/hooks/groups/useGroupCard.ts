import type { IGroupCardProps } from '@/components';
import { usePlayer } from '@/hooks/usePlayer';
import { useDeleteGroupMutation } from '@/services';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export const useGroupCard = (props: IGroupCardProps) => {
  const { group } = props;
  const { setQueue, play } = usePlayer();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showRename, setShowRename] = useState(false);

  const { mutate: deleteGroup } = useDeleteGroupMutation();

  const handleDeleteGroup = useCallback(
    (id: string) => {
      deleteGroup(
        { groupId: id },
        {
          onSuccess: () => {
            toast.success('Group deleted');
          },
          onError: () => {
            toast.error("Couldn't delete group");
          },
        }
      );
    },
    [deleteGroup]
  );

  const playAll = () => {
    const tracks = group.tracks?.map(t => t.track) ?? [];
    if (tracks.length === 0) {
      return;
    }
    setQueue(tracks);
    play(tracks[0]);
  };

  return {
    playAll,
    menuOpen,
    setMenuOpen,
    showDelete,
    setShowDelete,
    showRename,
    setShowRename,
    handleDeleteGroup,
  };
};
