import { useAuth } from '@/hooks/useAuth';
import type { ITrackQueryParams } from '@/interfaces';
import { useDebounce } from '@/lib';
import { useGetTrackListQuery } from '@/services';
import { useMemo, useState } from 'react';

export type SortOption = 'recent' | 'title_asc' | 'artist_asc';

const sortToApiParam: Record<
  SortOption,
  NonNullable<ITrackQueryParams['sort']>
> = {
  recent: 'createdAt',
  title_asc: 'title',
  artist_asc: 'artist',
};

export const useLibrary = () => {
  const { user } = useAuth();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('recent');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isFetching } = useGetTrackListQuery({
    search: debouncedSearch || undefined,
    sort: sortToApiParam[sort],
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
    isFetching,
    tracks,
    debouncedSearch,
  };
};
