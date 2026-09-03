import type { IPlayerStateResponse, IPlayerStateUpdate } from '@/interfaces';

import { AxiosService } from '../axiosService';
import { PLAYER_ENDPOINTS } from './player.endpoints';

export const playerApi = {
  getState: () =>
    AxiosService.get<IPlayerStateResponse>(PLAYER_ENDPOINTS.STATE),

  updateState: (body: IPlayerStateUpdate) =>
    AxiosService.patch<IPlayerStateResponse>(PLAYER_ENDPOINTS.STATE, body),
};
