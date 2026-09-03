import type { ITrack } from './track.interface';

export interface IGroupTrackItem {
  track: ITrack;
  position: number;
  addedAt: string;
}

export interface IGroup {
  _id: string;
  name: string;
  owner: string;
  thumbnailKey?: string;
  thumbnailUrl: string | null;
  tracks: IGroupTrackItem[];
  trackCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IGroupResponse {
  data: IGroup;
}

export interface IGroupQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface IGroupBody {
  name: string;
}

export interface IGroupListResponse {
  data: IGroup[];
}
