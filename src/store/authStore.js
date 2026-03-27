import { create } from 'zustand';

const useAuthStore = create((set) => ({
    isLoggedIn: !!localStorage.getItem('accessToken'),
    userId: Number(localStorage.getItem('userId')),
    setLoggedIn: (value) => set({ isLoggedIn: value }),
    setUserId: (id) => {
        localStorage.setItem('userId', id);
        set({ userId: id });
    },
}));

export default useAuthStore;