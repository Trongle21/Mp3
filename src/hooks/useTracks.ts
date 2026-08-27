import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as tracksApi from "@/lib/api-tracks";
import type { Track, TrackQueryParams } from "@/interfaces/track.interface";

export function useTracks(params?: TrackQueryParams) {
  return useQuery({
    queryKey: ["tracks", params],
    queryFn: async () => (await tracksApi.listTracks(params)).data,
  });
}

export function useTrack(id: string) {
  return useQuery({
    queryKey: ["track", id],
    queryFn: async () => (await tracksApi.getTrack(id)).data.data,
    enabled: !!id,
  });
}

export function useUpdateTrack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Pick<Track, "title" | "artist" | "album">> }) =>
      tracksApi.updateTrack(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tracks"] }),
  });
}

export function useDeleteTrack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tracksApi.deleteTrack(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tracks"] }),
  });
}
