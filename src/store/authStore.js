import { create } from 'zustand';

const useAuthStore = create((set) => ({
    isLoggedIn: !!localStorage.getItem('accessToken'),
    userId: Number(localStorage.getItem('userId')),
    userEmail: localStorage.getItem('userEmail') || '',
    userNickname: localStorage.getItem('userNickname') || '',
    setLoggedIn: (value) => set({ isLoggedIn: value }),
    setUserId: (id) => {
        localStorage.setItem('userId', id);
        set({ userId: id });
    },
    setUserInfo: ({ email, nickname }) => {
        if (email) localStorage.setItem('userEmail', email);
        if (nickname) localStorage.setItem('userNickname', nickname);
        set({
            userEmail: email || '',
            userNickname: nickname || '',
        });
    },
}));

export default useAuthStore;