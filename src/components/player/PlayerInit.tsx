"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/stores/player.store";

export function PlayerInit() {
  const init = usePlayerStore((s) => s.init);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
