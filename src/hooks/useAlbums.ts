// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import * as albumsApi from "@/lib/api-albums";
// import type { IAlbumQueryParams } from "@/interfaces/album.interface";

// export function useAlbums(params?: IAlbumQueryParams) {
//   return useQuery({
//     queryKey: ['albums', params],
//     queryFn: async () => (await albumsApi.listAlbums(params)).data,
//   });
// }

// export function useAlbum(id: string) {
//   return useQuery({
//     queryKey: ["album", id],
//     queryFn: async () => (await albumsApi.getAlbum(id)).data.data,
//     enabled: !!id,
//   });
// }

// export function useCreateAlbum() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: albumsApi.createAlbum,
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ["albums"] }),
//   });
// }

// export function useUpdateAlbum() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({
//       id,
//       body,
//     }: {
//       id: string;
//       body: Parameters<typeof albumsApi.updateAlbum>[1];
//     }) => albumsApi.updateAlbum(id, body),
//     onSuccess: (_, { id }) => {
//       queryClient.invalidateQueries({ queryKey: ["albums"] });
//       queryClient.invalidateQueries({ queryKey: ["album", id] });
//     },
//   });
// }

// export function useDeleteAlbum() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (id: string) => albumsApi.deleteAlbum(id),
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ["albums"] }),
//   });
// }

// export function useUploadAlbumThumbnail() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, file }: { id: string; file: File }) =>
//       albumsApi.uploadAlbumThumbnail(id, file),
//     onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ["album", id] }),
//   });
// }

// export function useDeleteAlbumThumbnail() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (id: string) => albumsApi.deleteAlbumThumbnail(id),
//     onSuccess: (_, id) => queryClient.invalidateQueries({ queryKey: ["album", id] }),
//   });
// }

// export function useAddTrackToAlbum(albumId: string) {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (trackId: string) => albumsApi.addTrackToAlbum(albumId, trackId),
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ["album", albumId] }),
//   });
// }

// export function useRemoveTrackFromAlbum(albumId: string) {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (trackId: string) => albumsApi.removeTrackFromAlbum(albumId, trackId),
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ["album", albumId] }),
//   });
// }

// export function useReorderAlbumTracks(albumId: string) {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (trackIds: string[]) => albumsApi.reorderAlbumTracks(albumId, trackIds),
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ["album", albumId] }),
//   });
// }
