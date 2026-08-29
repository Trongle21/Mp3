import type { ApiSuccess } from "@/types/api-response";
import type {
  PlayerState,
  PlayerStateUpdate,
} from "@/interfaces/player.interface";
import { ApiClient } from "@/api";

export const getPlayerState = () =>
  ApiClient.get<ApiSuccess<PlayerState>>("/player/state");

export const updatePlayerState = (body: PlayerStateUpdate) =>
  ApiClient.patch<ApiSuccess<PlayerState>>("/player/state", body);
