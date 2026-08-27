import type { Track } from "./track.interface";

export interface GroupTrackItem {
  track: Track;
  position: number;
  addedAt: string;
}

export interface Group {
  _id: string;
  name: string;
  owner: string;
  thumbnailKey?: string;
  tracks: GroupTrackItem[];
  trackCount: number;
  createdAt: string;
  updatedAt: string;
}
