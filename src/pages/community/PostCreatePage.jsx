import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

export default function PostCreatePage() {
    const [form, setForm] = useState({ category: '', title: '', content: '', petId: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post('/api/posts', {
            ...form,
            petId: form.petId ? Number(form.petId) : null,
        });
        alert('작성 완료!');
        navigate('/');
    };

    return (
        <div>
            <h2>글쓰기</h2>
            <form onSubmit={handleSubmit}>
                <select name="category" onChange={handleChange}>
                    <option value="">카테고리 선택</option>
                    <option value="자랑">자랑</option>
                    <option value="고민">고민</option>
                    <option value="정보">정보</option>
                    <option value="질문">질문</option>
                </select>
                <input name="title" placeholder="제목" onChange={handleChange} />
                <textarea name="content" placeholder="내용" onChange={handleChange} />
                <button type="submit">등록</button>
                <button type="button" onClick={() => navigate('/')}>취소</button>
            </form>
        </div>
    );
}