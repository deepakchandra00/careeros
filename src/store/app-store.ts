"use client";

import { create } from "zustand";
import type { ModuleId } from "@/lib/modules";

interface AppState {
  activeModule: ModuleId;
  sidebarOpen: boolean;
  setModule: (m: ModuleId) => void;
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeModule: "dashboard",
  sidebarOpen: false,
  setModule: (m) => set({ activeModule: m, sidebarOpen: false }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebar: (open) => set({ sidebarOpen: open }),
}));
