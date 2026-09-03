import type { ITrack } from './track.interface';

export interface IAlbumTrackItem {
  _id: string;
  position: number;
  addedAt: string;
  track: ITrack;
}

export interface IAlbum {
  _id: string;
  title: string;
  artist: string;
  description: string;
  year: number | null;
  genre: string;
  thumbnailKey: string;
  thumbnailUrl: string | null;
  owner: string;
  tracks: IAlbumTrackItem[];
  trackCount: number;
  totalDuration: number;
  createdAt: string;
  updatedAt: string;
}

export interface IAlbumResponse {
  data: IAlbum;
}

export interface IAlbumListItem {
  _id: string;
  title: string;
  artist: string;
  description: string;
  year: number | null;
  genre: string;
  thumbnailUrl: string | null;
  trackCount: number;
  totalDuration: number;
  createdAt: string;
}

export interface IAlbumQueryParams {
  search?: string;
  artist?: string;
  genre?: string;
  page?: number;
  limit?: number;
}

export interface IAlbumBody {
  title: string;
  artist?: string;
  description?: string;
  year?: number | null;
  genre?: string;
}
