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
  /** Direct URL to the group's thumbnail (R2 public). Only present when a thumbnail has been set. */
  thumbnailUrl?: string;
  tracks: GroupTrackItem[];
  trackCount: number;
  createdAt: string;
  updatedAt: string;
}
