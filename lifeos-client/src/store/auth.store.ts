import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { IAuthState, IUser } from '../types/auth.types';

export const useAuthStore = create<IAuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user: IUser, accessToken: string, refreshToken: string) => {
        if (typeof window !== 'undefined') {
          // Store token in cookie as well so Next.js middleware can inspect it
          document.cookie = `lifeos_token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
        }
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      setAccessToken: (accessToken: string) => {
        if (typeof window !== 'undefined') {
          document.cookie = `lifeos_token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
        }
        set({ accessToken });
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          document.cookie = 'lifeos_token=; path=/; max-age=0; SameSite=Lax';
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: 'lifeos-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
