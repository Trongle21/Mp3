import { z } from "zod";

export const uploadTrackMetaSchema = z.object({
  title: z.string().optional(),
  artist: z.string().optional(),
  album: z.string().optional(),
});
export type UploadTrackMetaInput = z.infer<typeof uploadTrackMetaSchema>;

export const updateTrackSchema = z.object({
  title: z.string().min(1).optional(),
  artist: z.string().min(1).optional(),
  album: z.string().optional(),
});
export type UpdateTrackInput = z.infer<typeof updateTrackSchema>;

export const trackQuerySchema = z.object({
  search: z.string().optional(),
  sort: z.enum(["recent", "title_asc", "artist_asc"]).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
});
export type TrackQueryInput = z.infer<typeof trackQuerySchema>;
