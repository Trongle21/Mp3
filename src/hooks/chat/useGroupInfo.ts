import { useAuth } from '@/hooks/useAuth';
import {
  useAddConversationMemberMutation,
  useRemoveConversationMemberMutation,
  useRenameConversationMutation,
  useUploadConversationAvatarMutation,
} from '@/services';
import type { Conversation, UserBasic } from '@/interfaces';
import { useCallback, useState } from 'react';

interface UseGroupInfoOptions {
  conversation: Conversation | null;
}

export const useGroupInfo = ({ conversation }: UseGroupInfoOptions) => {
  const { user } = useAuth();
  const currentUserId = user?._id ?? null;

  const isGroup = conversation?.type === 'group';
  const ownerId = conversation?.owner?._id;
  const isOwner = !!ownerId && ownerId === currentUserId;

  const [addOpen, setAddOpen] = useState(false);

  const { mutateAsync: rename } = useRenameConversationMutation();
  const { mutateAsync: uploadAvatar } = useUploadConversationAvatarMutation();
  const { mutateAsync: addMember } = useAddConversationMemberMutation();
  const { mutateAsync: removeMember } =
    useRemoveConversationMemberMutation();

  const handleRename = useCallback(
    async (name: string) => {
      if (!name.trim() || !conversation) {
        return;
      }
      await rename({ conversationId: conversation._id, body: { name } });
    },
    [conversation, rename]
  );

  const handleAvatar = useCallback(
    async (file: File) => {
      if (!conversation) {
        return;
      }
      await uploadAvatar({ conversationId: conversation._id, file });
    },
    [conversation, uploadAvatar]
  );

  const handleAddMember = useCallback(
    async (userId: string) => {
      if (!conversation) {
        return;
      }
      await addMember({
        conversationId: conversation._id,
        body: { userId },
      });
    },
    [conversation, addMember]
  );

  const handleRemoveMember = useCallback(
    async (userId: string) => {
      if (!conversation) {
        return;
      }
      await removeMember({ conversationId: conversation._id, userId });
    },
    [conversation, removeMember]
  );

  const handleLeaveGroup = useCallback(async () => {
    if (!conversation || !currentUserId) {
      return;
    }
    await removeMember({ conversationId: conversation._id, userId: currentUserId });
  }, [conversation, currentUserId, removeMember]);

  return {
    isGroup,
    isOwner,
    members: conversation?.members ?? [],
    owner: conversation?.owner ?? null,
    addOpen,
    setAddOpen,
    handleRename,
    handleAvatar,
    handleAddMember,
    handleRemoveMember,
    handleLeaveGroup,
  };
};

export type { UserBasic };
