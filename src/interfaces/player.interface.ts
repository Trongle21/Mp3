import type { ITrack } from './track.interface';

export type RepeatMode = 'off' | 'one' | 'all';

export interface IPlayerState {
  user: string;
  currentTrack: ITrack | null;
  positionSec: number;
  isPlaying: boolean;
  repeatMode: RepeatMode;
  shuffle: boolean;
  queue: ITrack[];
  updatedAt: string;
}

export interface IPlayerStateUpdate {
  currentTrack?: ITrack | null;
  positionSec?: number;
  isPlaying?: boolean;
  queue?: ITrack[];
  repeatMode?: RepeatMode;
  shuffle?: boolean;
}

export interface IPlayerStateResponse {
  data: IPlayerState;
}
