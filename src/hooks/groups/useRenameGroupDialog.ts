import type { IRenameGroupDialogProps } from '@/components';
import { useUpdateGroupMutation } from '@/services';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export const useRenameGroupDialog = (props: IRenameGroupDialogProps) => {
  const { group, open, onOpenChange } = props;

  const [name, setName] = useState(group.name);

  const { mutateAsync: updateGroup, isPending: isUpdatingGroup } =
    useUpdateGroupMutation({
      configs: {
        onSuccess: () => {
          toast.success('Group renamed');
          onOpenChange(false);
        },
        onError: () => {
          toast.error("Couldn't rename group");
        },
      },
    });

  useEffect(() => {
    if (open) {
      setName(group.name);
    }
  }, [open, group]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = name.trim();
      if (!trimmed) {
        return;
      }
      try {
        await updateGroup({
          groupId: group._id,
          body: { name: trimmed },
        });
      } catch (err) {
        console.error('Rename group failed:', err);
      }
    },
    [name, group._id, updateGroup]
  );

  return {
    handleSubmit,
    isSubmitting: isUpdatingGroup,
    name,
    setName,
  };
};
