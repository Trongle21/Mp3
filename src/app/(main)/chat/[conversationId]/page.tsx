'use client';

import {
  ChatHeader,
  ChatInputBar,
  GroupInfoDialog,
  MessageList,
} from '@/components/chat';
import { useChatConnection } from '@/hooks/chat';
import { useChatInput } from '@/hooks/chat/useChatInput';
import { useChatWindow } from '@/hooks/chat/useChatWindow';
import { useGroupInfo } from '@/hooks/chat/useGroupInfo';
import { useChatStore } from '@/stores/chat.store';
import type { LocalMessage } from '@/interfaces';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { CHAT_QUERY_KEYS } from '@/constants';

export default function ChatConversationPage() {
  useChatConnection();

  const params = useParams<{ conversationId: string }>();
  const conversationId = params?.conversationId ?? '';
  const router = useRouter();
  const queryClient = useQueryClient();

  const presence = useChatStore((s) => s.presence);

  const {
    conversation,
    isLoadingConversation,
    messages,
    isLoadingMessages,
    hasNextPage,
    isFetchingNextPage,
    loadMore,
    currentUserId,
    jumpToMessage,
    highlightedMessageId,
    clearHighlight,
  } = useChatWindow({ conversationId });

  const {
    text,
    setText,
    replyTo,
    cancelReply,
    sendText,
    handleKeyDown,
    onPickFile,
    fileInputRef,
    pendingImage,
    cancelPendingImage,
    isUploading,
    uploadProgress,
    editingMessageId,
    editDraft,
    setEditDraft,
    startEdit,
    cancelEdit,
    submitEdit,
    removeMessage,
    toggleReaction,
    setReplyTo,
  } = useChatInput({ conversationId });

  const {
    isGroup: _isGroup,
    isOwner,
    handleRename,
    handleAvatar,
    handleAddMember,
    handleRemoveMember,
    handleLeaveGroup,
  } = useGroupInfo({ conversation: conversation ?? null });

  const [infoOpen, setInfoOpen] = useState(false);

  // If the conversation no longer exists (e.g. user was kicked), bounce back.
  useEffect(() => {
    if (!conversationId) {
      return;
    }
    if (!isLoadingConversation && !conversation) {
      toast.error('Conversation not available');
      router.replace('/chat');
    }
  }, [conversation, isLoadingConversation, conversationId, router]);

  if (!conversationId) {
    return null;
  }

  return (
    <div className="flex h-[calc(100vh-160px)] flex-col lg:h-[calc(100vh-120px)]">
      {conversation ? (
        <ChatHeader
          conversation={conversation}
          currentUserId={currentUserId}
          presence={presence}
          onOpenInfo={() => setInfoOpen(true)}
        />
      ) : (
        <div className="border-b border-border px-4 py-3">
          <div className="h-10 w-40 animate-pulse rounded bg-bg-elevated" />
        </div>
      )}

      <MessageList
        messages={messages}
        selfUserId={currentUserId}
        isLoading={isLoadingMessages || isLoadingConversation}
        hasMore={hasNextPage}
        isFetchingMore={isFetchingNextPage}
        onLoadMore={loadMore}
        onReact={(messageId, emoji) => toggleReaction(messageId, emoji)}
        onStartEdit={(m: LocalMessage) => startEdit(m)}
        onDelete={(m: LocalMessage) => removeMessage(m._id)}
        onReply={(m: LocalMessage) => setReplyTo(m)}
        onJumpToMessage={(id: string) => {
          void jumpToMessage(id);
        }}
        highlightedMessageId={highlightedMessageId}
        onClearHighlight={clearHighlight}
      />

      <ChatInputBar
        text={text}
        setText={setText}
        replyTo={replyTo}
        cancelReply={cancelReply}
        onSend={() => void sendText()}
        onKeyDown={handleKeyDown}
        onPickFile={onPickFile}
        fileInputRef={fileInputRef}
        pendingImage={pendingImage}
        cancelPendingImage={cancelPendingImage}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        editingMessageId={editingMessageId}
        editDraft={editDraft}
        setEditDraft={setEditDraft}
        cancelEdit={cancelEdit}
        submitEdit={() => void submitEdit()}
      />

      {conversation && (
        <GroupInfoDialog
          open={infoOpen}
          onOpenChange={setInfoOpen}
          conversation={conversation}
          currentUserId={currentUserId}
          isOwner={isOwner}
          onRename={async (name) => {
            try {
              await handleRename(name);
              toast.success('Group renamed');
            } catch {
              toast.error("Couldn't rename group");
            }
          }}
          onAvatar={async (file) => {
            try {
              await handleAvatar(file);
              toast.success('Avatar updated');
            } catch {
              toast.error("Couldn't update avatar");
            }
          }}
          onAddMember={async (userId) => {
            try {
              await handleAddMember(userId);
              toast.success('Member added');
            } catch {
              toast.error("Couldn't add member");
            }
          }}
          onRemoveMember={async (userId) => {
            try {
              await handleRemoveMember(userId);
              toast.success('Member removed');
            } catch {
              toast.error("Couldn't remove member");
            }
          }}
          onLeaveGroup={async () => {
            try {
              await handleLeaveGroup();
              setInfoOpen(false);
              router.replace('/chat');
              queryClient.invalidateQueries({
                queryKey: [CHAT_QUERY_KEYS.GET_CONVERSATIONS],
              });
            } catch {
              toast.error("Couldn't leave group");
            }
          }}
        />
      )}
    </div>
  );
}
