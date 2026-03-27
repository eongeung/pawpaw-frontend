import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const res = await axios.post('http://localhost:8080/api/auth/reissue', null, {
                        headers: { 'Refresh-Token': refreshToken },
                    });
                    localStorage.setItem('accessToken', res.data.accessToken);
                    localStorage.setItem('refreshToken', res.data.refreshToken);
                    error.config.headers.Authorization = `Bearer ${res.data.accessToken}`;
                    return instance(error.config);
                } catch {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default instance;