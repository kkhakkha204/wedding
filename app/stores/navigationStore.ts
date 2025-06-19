import { create } from 'zustand'

interface NavigationState {
  targetSection: string | null
  setTargetSection: (section: string | null) => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  targetSection: null,
  setTargetSection: (section) => set({ targetSection: section }),
}))
