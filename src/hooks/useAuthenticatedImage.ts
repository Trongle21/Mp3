"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

/**
 * Fetch an authenticated image and expose it as a blob object URL.
 *
 * Cancels the fetch on unmount or when the endpoint changes so we don't leak
 * object URLs or set state on an unmounted component. Revokes the previous
 * object URL as soon as a new one is created or the consumer unmounts.
 */
export function useAuthenticatedImage(endpoint: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!endpoint) {
      setUrl(null);
      return;
    }

    let active = true;
    let currentObjectUrl: string | null = null;

    (async () => {
      try {
        const res = await api.get<Blob>(endpoint, { responseType: "blob" });
        if (!active) return;
        currentObjectUrl = URL.createObjectURL(res.data);
        setUrl(currentObjectUrl);
      } catch (err) {
        if (!active) return;
        console.warn("useAuthenticatedImage: failed to load", endpoint, err);
        setUrl(null);
      }
    })();

    return () => {
      active = false;
      if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
    };
  }, [endpoint]);

  return url;
}