import { useGetGroupListQuery } from '@/services';
import { useState } from 'react';

export const useGroup = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: groupsData, isLoading } = useGetGroupListQuery({
    search: search || undefined,
  });

  return {
    createOpen,
    setCreateOpen,
    search,
    setSearch,
    groupsData,
    isLoading,
  };
};
