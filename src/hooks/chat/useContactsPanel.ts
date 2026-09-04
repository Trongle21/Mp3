import {
  useDecideContactRequestMutation,
  useGetContactsQuery,
  useRemoveContactMutation,
  useSendContactRequestMutation,
} from '@/services';
import { useState } from 'react';

export const useContactsPanel = () => {
  const [recipientId, setRecipientId] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [search, setSearch] = useState('');

  const { data: contacts, isLoading } = useGetContactsQuery();

  const { mutateAsync: sendRequest, isPending: isSending } =
    useSendContactRequestMutation();
  const { mutateAsync: decide, isPending: isDeciding } =
    useDecideContactRequestMutation();
  const { mutateAsync: removeContact, isPending: isRemoving } =
    useRemoveContactMutation();

  const handleSendRequest = async () => {
    const value = recipientId.trim();
    if (!value) {
      return;
    }
    await sendRequest({ recipientId: value });
    setRecipientId('');
  };

  const handleSendByEmail = async () => {
    const value = emailInput.trim();
    if (!value) {
      return;
    }
    await sendRequest({ email: value });
    setEmailInput('');
  };

  const handleAccept = async (contactId: string) => {
    await decide({ contactId, body: { action: 'accept' } });
  };

  const handleDecline = async (contactId: string) => {
    await decide({ contactId, body: { action: 'decline' } });
  };

  const handleRemove = async (contactId: string) => {
    await removeContact({ contactId });
  };

  const filteredContacts = (() => {
    if (!contacts) {
      return [];
    }
    const q = search.trim().toLowerCase();
    if (!q) {
      return contacts;
    }
    return contacts.filter(
      (c) =>
        c.user.name.toLowerCase().includes(q) ||
        c.user.email.toLowerCase().includes(q)
    );
  })();

  return {
    contacts: filteredContacts,
    isLoading,
    search,
    setSearch,
    recipientId,
    setRecipientId,
    emailInput,
    setEmailInput,
    handleSendRequest,
    handleSendByEmail,
    handleAccept,
    handleDecline,
    handleRemove,
    isSending,
    isDeciding,
    isRemoving,
  };
};
