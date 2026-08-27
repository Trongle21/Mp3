import api from "./api";
import type { ApiSuccess } from "@/types/api-response";
import type { PlayerState, PlayerStateUpdate } from "@/interfaces/player.interface";

export const getPlayerState = () => api.get<ApiSuccess<PlayerState>>("/player/state");

export const updatePlayerState = (body: PlayerStateUpdate) =>
  api.patch<ApiSuccess<PlayerState>>("/player/state", body);
