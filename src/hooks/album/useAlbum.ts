import { useGetAlbumListQuery } from '@/services';
import { useState } from 'react';

export const useAlbum = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: albumsData, isLoading } = useGetAlbumListQuery({
    search: search || undefined,
  });

  return {
    createOpen,
    setCreateOpen,
    search,
    setSearch,
    albumsData,
    isLoading,
  };
};
