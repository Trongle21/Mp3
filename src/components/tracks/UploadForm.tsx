"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, Music } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePicker } from "@/components/shared/ImagePicker";
import { uploadTrack, uploadTrackCover } from "@/lib/api-tracks";
import { useAlbums } from "@/hooks/useAlbums";
import { cn } from "@/lib/utils";

interface UploadFormProps {
  onDone: () => void;
}

export function UploadForm({ onDone }: UploadFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { data: albumsData } = useAlbums({ limit: 100 });

  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [meta, setMeta] = useState({ title: "", artist: "", albumId: "" });

  const handleFile = (f: File) => {
    if (!f.type.startsWith("audio/")) {
      toast.error("Please choose an audio file");
      return;
    }
    setFile(f);
    setMeta((m) => ({ ...m, title: m.title || f.name.replace(/\.[^/.]+$/, "") }));
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFile(dropped);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (meta.title) formData.append("title", meta.title);
      if (meta.artist) formData.append("artist", meta.artist);
      if (meta.albumId) formData.append("albumId", meta.albumId);

      const { data: track } = (await uploadTrack(formData, setProgress)).data;

      if (coverFile) {
        try {
          await uploadTrackCover(track._id, coverFile);
        } catch (err) {
          console.warn("Cover upload failed:", err);
          toast.warning("Track uploaded, but the cover image couldn't be saved.");
        }
      }

      queryClient.invalidateQueries({ queryKey: ["tracks"] });
      if (meta.albumId) {
        queryClient.invalidateQueries({ queryKey: ["album", meta.albumId] });
      }
      toast.success("Track uploaded");
      onDone();
    } catch {
      toast.error("Upload failed. Try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!file) {
    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-colors",
          isDragging ? "border-accent bg-accent-dim" : "border-border hover:border-text-muted"
        )}
      >
        <UploadCloud className={cn("h-10 w-10", isDragging ? "text-accent" : "text-text-muted")} />
        <p className="mt-3 text-body text-text-primary">Drag an audio file here, or click to browse</p>
        <p className="mt-1 text-caption text-text-muted">MP3, WAV, FLAC, and more</p>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-bg-elevated p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded bg-bg-highlight">
          <Music className="h-5 w-5 text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-body text-text-primary">{file.name}</p>
          <p className="text-caption text-text-muted">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
        </div>
      </div>

      <Input
        placeholder="Title"
        value={meta.title}
        onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))}
      />
      <Input
        placeholder="Artist"
        value={meta.artist}
        onChange={(e) => setMeta((m) => ({ ...m, artist: e.target.value }))}
      />

      <div className="space-y-1.5">
        <p className="text-caption text-text-secondary">Album (optional)</p>
        <select
          value={meta.albumId}
          onChange={(e) => setMeta((m) => ({ ...m, albumId: e.target.value }))}
          disabled={isUploading}
          className="flex h-11 w-full cursor-pointer rounded-md border border-border bg-bg-elevated px-3 text-body text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">No album</option>
          {albumsData?.data.map((album) => (
            <option key={album._id} value={album._id}>
              {album.title} {album.artist ? `— ${album.artist}` : ""}
            </option>
          ))}
        </select>
      </div>

      <ImagePicker
        file={coverFile}
        onChange={setCoverFile}
        label="Cover image (optional)"
        disabled={isUploading}
      />

      {isUploading && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-highlight">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button
          variant="ghost"
          onClick={() => {
            setFile(null);
            setCoverFile(null);
          }}
          disabled={isUploading}
        >
          Choose another
        </Button>
        <Button onClick={handleUpload} disabled={isUploading}>
          {isUploading ? `Uploading ${progress}%` : "Upload"}
        </Button>
      </div>
    </div>
  );
}
