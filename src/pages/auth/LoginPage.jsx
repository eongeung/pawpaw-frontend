import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import axios from '../../api/axios';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const navigate = useNavigate();
    const setLoggedIn = useAuthStore((state) => state.setLoggedIn);
    const setUserId = useAuthStore((state) => state.setUserId);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/login', form);
            localStorage.setItem('accessToken', res.data.accessToken);
            localStorage.setItem('refreshToken', res.data.refreshToken);
            setLoggedIn(true);
            setUserId(res.data.userId);
            navigate('/');
        } catch (err) {
            alert('로그인 실패');
        }
    };

    return (
        <div>
            <h2>로그인</h2>
            <form onSubmit={handleSubmit}>
                <input name="email" placeholder="이메일" onChange={handleChange} />
                <input name="password" type="password" placeholder="비밀번호" onChange={handleChange} />
                <button type="submit">로그인</button>
            </form>
            <button onClick={() => navigate('/signup')}>회원가입</button>
        </div>
    );
}