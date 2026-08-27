import type { Track } from "./track.interface";

export interface AlbumTrackItem {
  _id: string;
  position: number;
  addedAt: string;
  track: Track;
}

export interface Album {
  _id: string;
  title: string;
  artist: string;
  description: string;
  year: number | null;
  genre: string;
  thumbnailKey: string;
  thumbnailUrl: string | null;
  owner: string;
  tracks: AlbumTrackItem[];
  trackCount: number;
  totalDuration: number;
  createdAt: string;
  updatedAt: string;
}

export interface AlbumListItem {
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

export interface AlbumQueryParams {
  search?: string;
  artist?: string;
  genre?: string;
  page?: number;
  limit?: number;
}
