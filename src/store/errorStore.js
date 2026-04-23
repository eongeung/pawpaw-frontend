import { create } from 'zustand';

const useErrorStore = create((set) => ({
  networkError: false,
  sessionExpired: false,
  setNetworkError: (v) => set({ networkError: v }),
  setSessionExpired: (v) => set({ sessionExpired: v }),
}));

export default useErrorStore;
