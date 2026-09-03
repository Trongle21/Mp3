import { playerApi } from '@/api';
import { PLAYER_QUERY_KEYS } from '@/constants';
import type { IPlayerStateResponse, IPlayerStateUpdate } from '@/interfaces';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type IVariablesType = {
  body: IPlayerStateUpdate;
};

type IMutationParams = {
  configs?: IAppMutationOptions<
    IVariablesType,
    IApiResponse<IPlayerStateResponse>
  >;
};

export const useUpdatePlayerStateMutation = (
  mutationParams?: IMutationParams
) => {
  const { configs } = { ...mutationParams };

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: IVariablesType) => playerApi.updateState(values.body),

    ...configs,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PLAYER_QUERY_KEYS.GET_PLAYER_STATE],
      });
    },
  });
};
