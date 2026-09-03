import { groupApi } from '@/api';
import type { IGroupResponse } from '@/interfaces';
import type { IApiResponse, IAppMutationOptions } from '@/types';
import { useMutation } from '@tanstack/react-query';

type IVariablesType = {
  groupId: string;
  file: File;
};

type IMutationParams = {
  configs?: IAppMutationOptions<IVariablesType, IApiResponse<IGroupResponse>>;
};

export const useUploadGroupThumbnailMutation = (
  mutationParams?: IMutationParams
) => {
  const { configs } = { ...mutationParams };

  return useMutation({
    mutationFn: (values: IVariablesType) =>
      groupApi.uploadThumbnail(values.groupId, values.file),

    ...configs,
  });
};
