export interface ITrack {
  _id: string;
  title: string;
  artist: string;
  album: string;
  durationSec: number;
  fileKey: string;
  coverKey: string;
  /** Direct URL to the cover art (R2 public). */
  coverUrl: string;
  mimeType: string;
  sizeBytes: number;
  owner: string;
  createdAt: string;
}

export interface ITrackResponse {
  data: ITrack;
}

/** Track enriched with derived, ready-to-use URLs for playback and display. */
export interface TrackWithStream extends ITrack {
  streamUrl: string;
  coverUrl: string;
}

export interface TrackQueryParams {
  search?: string;
  sort?: 'recent' | 'title_asc' | 'artist_asc';
  page?: number;
  limit?: number;
  /** Filter tracks by album ID (populates album info). */
  albumId?: string;
}
