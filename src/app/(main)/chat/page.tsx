'use client';

import {
  ChatSidebar,
  ContactsPanel,
  ConversationsList,
  CreateGroupChatDialog,
} from '@/components/chat';
import { useChatConnection, useChatSidebar } from '@/hooks/chat';
import { useSyncConversationsToStore } from '@/hooks/chat/useSyncConversationsToStore';

export default function ChatPage() {
  useChatConnection();

  const {
    currentUserId,
    tab,
    setTab,
    chatSearch,
    setChatSearch,
    contactsSearch,
    setContactsSearch,
    conversations,
    isLoadingConversations,
    createGroupOpen,
    setCreateGroupOpen,
    pendingRequestCount,
    totalUnread,
    contacts,
    isLoading,
    recipientId,
    setRecipientId,
    emailInput,
    setEmailInput,
    handleSendRequest,
    handleSendByEmail,
    handleAccept,
    handleDecline,
    handleRemove,
    onMessageContact,
    isSending,
    isDeciding,
    isRemoving,
    outgoingRequests,
    name: groupName,
    setName: setGroupName,
    selectedUserIds,
    toggleMember,
    submit: submitGroup,
    isPending: isCreatingGroup,
    incomingRequests,
  } = useChatSidebar();

  useSyncConversationsToStore(conversations);

  const tabs = [
    { value: 'chats' as const, label: 'Chats', badge: totalUnread },
    {
      value: 'contacts' as const,
      label: 'Friends',
      badge: pendingRequestCount,
    },
  ];

  return (
    <div className="animate-fade-slide-in pt-4">
      <ChatSidebar
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
        searchValue={tab === 'chats' ? chatSearch : contactsSearch}
        onSearchChange={(v) =>
          tab === 'chats' ? setChatSearch(v) : setContactsSearch(v)
        }
        searchPlaceholder={tab === 'chats' ? 'Search chats' : 'Search friends'}
        onCreateGroup={() => setCreateGroupOpen(true)}
        createLabel="New group"
      >
        {tab === 'chats' && (
          <ConversationsList
            conversations={conversations}
            currentUserId={currentUserId}
            isLoading={isLoadingConversations}
            onCreateGroup={() => setCreateGroupOpen(true)}
            emptyHint="No conversations yet — start a new chat with a friend."
          />
        )}
        {tab === 'contacts' && (
          <ContactsPanel
            contacts={contacts}
            incoming={incomingRequests}
            outgoing={outgoingRequests}
            isLoading={isLoading}
            search={contactsSearch}
            setSearch={setContactsSearch}
            recipientId={recipientId}
            setRecipientId={setRecipientId}
            emailInput={emailInput}
            setEmailInput={setEmailInput}
            onSendRequest={handleSendRequest}
            onSendByEmail={handleSendByEmail}
            onAccept={handleAccept}
            onDecline={handleDecline}
            onRemove={handleRemove}
            onMessageContact={onMessageContact}
            isSending={isSending}
            isDeciding={isDeciding}
            isRemoving={isRemoving}
          />
        )}
      </ChatSidebar>

      <CreateGroupChatDialog
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
        contacts={contacts}
        name={groupName}
        setName={setGroupName}
        selectedUserIds={selectedUserIds}
        toggleMember={toggleMember}
        onSubmit={submitGroup}
        isSubmitting={isCreatingGroup}
      />
    </div>
  );
}
