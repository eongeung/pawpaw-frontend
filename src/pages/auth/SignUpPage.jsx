import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

export default function SignUpPage() {
    const [form, setForm] = useState({ email: '', password: '', nickname: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/auth/signup', form);
            alert('회원가입 완료!');
            navigate('/login');
        } catch (err) {
            alert('회원가입 실패');
        }
    };

    return (
        <div>
            <h2>회원가입</h2>
            <form onSubmit={handleSubmit}>
                <input name="email" placeholder="이메일" onChange={handleChange} />
                <input name="password" type="password" placeholder="비밀번호" onChange={handleChange} />
                <input name="nickname" placeholder="닉네임" onChange={handleChange} />
                <button type="submit">회원가입</button>
            </form>
        </div>
    );
}