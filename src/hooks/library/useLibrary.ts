import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/lib';
import { useGetTrackListQuery } from '@/services';
import { useMemo, useState } from 'react';

export type SortOption = 'recent' | 'title_asc' | 'artist_asc';

export const useLibrary = () => {
  const { user } = useAuth();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('recent');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useGetTrackListQuery({
    search: debouncedSearch || undefined,
    sort,
  });

  const tracks = useMemo(() => data?.data ?? [], [data]);

  return {
    user,
    uploadOpen,
    setUploadOpen,
    search,
    setSearch,
    sort,
    setSort,
    isLoading,
    tracks,
    debouncedSearch,
  };
};
