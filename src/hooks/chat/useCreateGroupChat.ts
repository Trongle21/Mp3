import { useAuth } from '@/hooks/useAuth';
import { useCreateConversationMutation } from '@/services';
import { useState } from 'react';

interface UseCreateGroupChatOptions {
  onCreated?: (conversationId: string) => void;
}

/**
 * Hook backing the "New group" dialog in the chat sidebar. Lets the user
 * pick friends (from their contacts list) and a group name, then creates
 * the conversation.
 */
export const useCreateGroupChat = (options?: UseCreateGroupChatOptions) => {
  const { onCreated } = options ?? {};
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const { mutateAsync: createConversation, isPending } =
    useCreateConversationMutation();

  const toggleMember = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const reset = () => {
    setName('');
    setSelectedUserIds([]);
  };

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed || selectedUserIds.length === 0) {
      return;
    }
    const res = await createConversation({
      body: {
        type: 'group',
        name: trimmed,
        memberIds: selectedUserIds,
      },
    });
    const newId = res?.data?.data?._id;
    if (newId) {
      reset();
      onCreated?.(newId);
    }
  };

  const startDirect = async (recipientId: string) => {
    if (!user?._id || recipientId === user._id) {
      return;
    }
    const res = await createConversation({
      body: { type: 'direct', recipientId },
    });
    const newId = res?.data?.data?._id;
    if (newId) {
      onCreated?.(newId);
    }
  };

  return {
    name,
    setName,
    selectedUserIds,
    toggleMember,
    reset,
    submit,
    startDirect,
    isPending,
  };
};
