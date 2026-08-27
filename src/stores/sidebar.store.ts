import { create } from "zustand";

interface SidebarState {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

/**
 * Mobile sidebar visibility. On desktop (lg+) the sidebar is always rendered
 * fixed, so this only matters for the off-canvas drawer on smaller screens.
 */
export const useSidebarStore = create<SidebarState>((set) => ({
  open: false,
  setOpen: (v) => set({ open: v }),
  toggle: () => set((s) => ({ open: !s.open })),
}));