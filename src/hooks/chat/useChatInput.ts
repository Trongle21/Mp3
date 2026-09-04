import { useAuth } from '@/hooks/useAuth';
import { conversationApi, uploadToPresignedUrl } from '@/api';
import {
  useReactMessageMutation,
  useSendMessageMutation,
  useEditMessageMutation,
  useDeleteMessageMutation,
} from '@/services';
import type { LocalMessage, Message, MessageType, SendMessageBody } from '@/interfaces';
import { useChatStore } from '@/stores/chat.store';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseChatInputOptions {
  conversationId: string;
}

interface PendingImage {
  file: File;
  previewUrl: string;
}

const QUICK_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '😡'];

/**
 * Owns the composer state: text, reply target, in-flight uploads and
 * optimistic message ids. Handles text send, image send (R2 presigned),
 * edit, delete, react.
 */
export const useChatInput = ({ conversationId }: UseChatInputOptions) => {
  const { user } = useAuth();
  const currentUserId = user?._id ?? null;

  const upsertMessage = useChatStore((s) => s.upsertMessage);
  const patchMessage = useChatStore((s) => s.patchMessage);
  const removeMessage = useChatStore((s) => s.removeMessage);

  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Release the object URL when the preview is cleared or the hook unmounts.
  useEffect(() => {
    if (!pendingImage) {
      return;
    }
    return () => {
      URL.revokeObjectURL(pendingImage.previewUrl);
    };
  }, [pendingImage]);

  const { mutateAsync: sendMessage } = useSendMessageMutation();
  const { mutateAsync: editMessage } = useEditMessageMutation();
  const { mutate: deleteMessage } = useDeleteMessageMutation();
  const { mutate: reactMessage } = useReactMessageMutation();

  const buildOptimisticMessage = useCallback(
    (
      body: SendMessageBody,
      localId: string
    ): LocalMessage => {
      const self = user
        ? {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
          }
        : {
            _id: 'self',
            name: 'You',
            email: '',
            avatarUrl: null,
          };
      return {
        _id: localId,
        conversationId,
        sender: self,
        type: body.type,
        content: body.content,
        mediaUrl: null,
        replyTo: body.replyTo
          ? {
              _id: body.replyTo,
              sender: { _id: '', name: '' },
              content: '',
              type: 'text',
              deletedAt: null,
            }
          : null,
        reactions: [],
        readBy: [],
        editedAt: null,
        deletedAt: null,
        createdAt: new Date().toISOString(),
        _pending: true,
      };
    },
    [conversationId, user]
  );

  const fillReplyFromStore = useCallback(
    (replyToId: string | undefined): Message['replyTo'] => {
      if (!replyToId) {
        return null;
      }
      const storeMessages =
        useChatStore.getState().messagesByConversation[conversationId];
      const original = storeMessages?.[replyToId];
      if (!original) {
        return null;
      }
      return {
        _id: original._id,
        sender: { _id: original.sender._id, name: original.sender.name },
        content: original.deletedAt ? 'Tin nhắn đã bị thu hồi' : original.content,
        type: original.type,
        deletedAt: original.deletedAt ?? null,
      };
    },
    [conversationId]
  );

  const sendText = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed && !pendingImage) {
      return;
    }
    // Snapshot the pending image up-front so the upload runs even if the
    // user clears the preview mid-flight.
    const capturedImage = pendingImage;
    setPendingImage(null);

    if (capturedImage) {
      await sendImage(capturedImage.file, trimmed);
      return;
    }

    const localId = `local_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const body: SendMessageBody = {
      type: 'text',
      content: trimmed,
      replyTo: replyTo?._id,
    };
    const optimistic = buildOptimisticMessage(body, localId);
    const resolvedReplyTo = fillReplyFromStore(body.replyTo);
    if (resolvedReplyTo) {
      optimistic.replyTo = resolvedReplyTo;
    }
    upsertMessage(conversationId, optimistic);
    setText('');
    const capturedReply = replyTo;
    setReplyTo(null);
    try {
      const result = await sendMessage({ conversationId, body });
      const real = result?.data?.data;
      if (real) {
        // Replace the optimistic placeholder with the server-confirmed message.
        removeMessage(conversationId, localId);
        upsertMessage(conversationId, real);
      }
      // Suppress unused-var lint for the capturedReply reference.
      void capturedReply;
    } catch {
      patchMessage(conversationId, localId, {
        content: `${trimmed} (failed to send)`,
      });
    }
  }, [
    text,
    pendingImage,
    replyTo,
    conversationId,
    buildOptimisticMessage,
    fillReplyFromStore,
    upsertMessage,
    removeMessage,
    patchMessage,
    sendMessage,
  ]);

  const sendImage = useCallback(
    async (file: File, caption: string = '') => {
      setIsUploading(true);
      setUploadProgress(0);
      const localId = `local_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      try {
        const presigned = await conversationApi.getUploadUrl(conversationId, {
          filename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        });
        const { uploadUrl, fileKey } = presigned.data;
        await uploadToPresignedUrl(uploadUrl, file, (percent) =>
          setUploadProgress(percent)
        );

        const body: SendMessageBody = {
          type: 'image',
          content: fileKey,
          replyTo: replyTo?._id,
        };
        const optimistic = buildOptimisticMessage(body, localId);
        const resolvedReplyTo = fillReplyFromStore(body.replyTo);
        if (resolvedReplyTo) {
          optimistic.replyTo = resolvedReplyTo;
        }
        // Render the local preview on the optimistic bubble until the
        // server-confirmed message arrives with its own mediaUrl.
        optimistic.mediaUrl = URL.createObjectURL(file);
        upsertMessage(conversationId, optimistic);
        setReplyTo(null);
        setText(caption);
        setUploadProgress(null);

        const result = await sendMessage({ conversationId, body });
        const real = result?.data?.data;
        if (real) {
          removeMessage(conversationId, localId);
          upsertMessage(conversationId, real);
        }
      } catch {
        patchMessage(conversationId, localId, {
          content: '(upload failed)',
        });
      } finally {
        setIsUploading(false);
        setUploadProgress(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [
      conversationId,
      replyTo,
      buildOptimisticMessage,
      fillReplyFromStore,
      upsertMessage,
      sendMessage,
      removeMessage,
      patchMessage,
    ]
  );

  const onPickFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }
      // Stage the file locally so the user can preview it and write a caption
      // before sending. Actual upload happens in sendText() / sendImage().
      setPendingImage({ file, previewUrl: URL.createObjectURL(file) });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    []
  );

  const cancelPendingImage = useCallback(() => {
    setPendingImage(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        void sendText();
      }
    },
    [sendText]
  );

  const startEdit = useCallback((m: Message) => {
    setEditingMessageId(m._id);
    setEditDraft(m.deletedAt ? '' : m.content);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setEditDraft('');
  }, []);

  const submitEdit = useCallback(async () => {
    if (!editingMessageId) {
      return;
    }
    const trimmed = editDraft.trim();
    if (!trimmed) {
      return;
    }
    patchMessage(conversationId, editingMessageId, { content: trimmed });
    setEditingMessageId(null);
    setEditDraft('');
    try {
      const res = await editMessage({
        conversationId,
        messageId: editingMessageId,
        content: trimmed,
      });
      const updated = res?.data?.data;
      if (updated) {
        patchMessage(conversationId, updated._id, {
          content: updated.content,
          editedAt: updated.editedAt ?? null,
        });
      }
    } catch {
      // Optimistic content remains; no revert needed for this prototype.
    }
  }, [conversationId, editDraft, editingMessageId, editMessage, patchMessage]);

  const removeMessageLocal = useCallback(
    (messageId: string) => {
      deleteMessage(
        { conversationId, messageId },
        {
          onSuccess: () => {
            patchMessage(conversationId, messageId, {
              deletedAt: new Date().toISOString(),
              content: 'Tin nhắn đã bị thu hồi',
              type: 'text',
            });
          },
        }
      );
    },
    [conversationId, deleteMessage, patchMessage]
  );

  const toggleReaction = useCallback(
    (messageId: string, emoji: string) => {
      reactMessage(
        { conversationId, messageId, emoji },
        {
          onSuccess: (res) => {
            const reactions = res?.data?.reactions;
            if (reactions) {
              patchMessage(conversationId, messageId, { reactions });
            }
          },
        }
      );
    },
    [conversationId, reactMessage, patchMessage]
  );

  const cancelReply = useCallback(() => setReplyTo(null), []);

  const startReply = useCallback((m: Message) => setReplyTo(m), []);

  return {
    text,
    setText,
    replyTo,
    setReplyTo: startReply,
    cancelReply,
    uploadProgress,
    isUploading,
    fileInputRef,
    onPickFile,
    pendingImage,
    cancelPendingImage,
    sendText,
    handleKeyDown,
    quickReactions: QUICK_REACTIONS,
    editingMessageId,
    editDraft,
    setEditDraft,
    startEdit,
    cancelEdit,
    submitEdit,
    removeMessage: removeMessageLocal,
    toggleReaction,
    currentUserId,
  };
};

export type { LocalMessage, MessageType };
