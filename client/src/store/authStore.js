import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(persist(
  (set) => ({
    user: null,
    accessToken: null,
    refreshToken: null,

    setAuth: (user, accessToken, refreshToken) =>
      set({ user, accessToken, refreshToken }),

    setTokens: (accessToken, refreshToken) =>
      set({ accessToken, refreshToken }),

    updateUser: (updates) =>
      set(state => ({ user: { ...state.user, ...updates } })),

    logout: () =>
      set({ user: null, accessToken: null, refreshToken: null })
  }),
  {
    name: 'nutriai-auth',
    partialState: (state) => ({
      user: state.user,
      refreshToken: state.refreshToken
      // NOTE: Don't persist accessToken — it's short-lived
    })
  }
));

export default useAuthStore;
