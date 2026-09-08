import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemeMode = 'dark' | 'light' | 'system';

interface IThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

export const useThemeStore = create<IThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme: ThemeMode) => {
        set({ theme });
        if (typeof window !== 'undefined') {
          const root = document.documentElement;
          root.classList.remove('light', 'dark');
          if (theme === 'system') {
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.add(systemDark ? 'dark' : 'light');
          } else {
            root.classList.add(theme);
          }
        }
      },
    }),
    {
      name: 'lifeos-theme',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
