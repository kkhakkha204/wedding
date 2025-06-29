import { create } from "zustand";
import { persist } from "zustand/middleware";

const AvailableColors = ['#0690d4', '#272727','#69594a'];

interface ThemeStore {
  colors: string[];
  color: string;
  nextColor: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      colors: [...AvailableColors],
      color: AvailableColors[2],
      nextColor: () => {
        const colors = get().colors;
        const activeColorIndex = colors.indexOf(get().color);
        const nextColorIndex = (activeColorIndex + 1) % colors.length;
        set(() => ({ color: colors[nextColorIndex] }));
      },
    }),
    {
      name: "theme-storage",
      partialize: (state) => ({ color: state.color }),
    }
  )
);