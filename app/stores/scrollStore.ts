import { create } from 'zustand';

interface ScrollStore {
  scrollProgress: number;
  setScrollProgress: (progress: number) => void;
  targetScrollProgress: number | null;  // ✅ Thêm target scroll
  setTargetScrollProgress: (progress: number | null) => void;  // ✅ Thêm setter
}

export const useScrollStore = create<ScrollStore>((set) => ({
  scrollProgress: 0,
  setScrollProgress: (progress) => set(() => ({ scrollProgress: progress })),
  targetScrollProgress: null,  // ✅ New
  setTargetScrollProgress: (progress) => set(() => ({ targetScrollProgress: progress })),  // ✅ New
}));