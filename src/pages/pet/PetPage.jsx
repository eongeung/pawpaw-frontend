import { useState, useEffect } from 'react';
import axios from '../../api/axios';

export default function PetPage() {
    const [pets, setPets] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: '', species: '', breed: '',
        age: '', gender: '', weight: '',
        description: '', isNeutered: false
    });

    useEffect(() => {
        axios.get('/api/pets/my').then((res) => setPets(res.data));
    }, []);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm({ ...form, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await axios.post('/api/pets', {
            ...form,
            age: form.age ? Number(form.age) : null,
            weight: form.weight ? Number(form.weight) : null,
        });
        setPets([...pets, res.data]);
        setForm({ name: '', species: '', breed: '', age: '', gender: '', weight: '', description: '', isNeutered: false });
        setShowForm(false);
        alert('펫 등록 완료!');
    };

    const handleDelete = async (petId) => {
        if (!window.confirm('정말 삭제할까요?')) return;
        await axios.delete(`/api/pets/${petId}`);
        setPets(pets.filter((p) => p.id !== petId));
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>내 반려동물</h2>
                <button onClick={() => setShowForm(!showForm)}>
                    {showForm ? '닫기' : '+ 반려동물 등록'}
                </button>
            </div>

            {showForm && (
                <div style={{ border: '1px solid #ccc', padding: '16px', marginBottom: '16px', borderRadius: '8px' }}>
                    <h3>반려동물 등록</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input name="name" placeholder="이름 *" value={form.name} onChange={handleChange} required />
                            <select name="species" value={form.species} onChange={handleChange} required>
                                <option value="">종류 선택 *</option>
                                <option value="강아지">강아지</option>
                                <option value="고양이">고양이</option>
                                <option value="기타">기타</option>
                            </select>
                            <input name="breed" placeholder="품종" value={form.breed} onChange={handleChange} />
                            <input name="age" placeholder="나이" type="number" value={form.age} onChange={handleChange} />
                            <select name="gender" value={form.gender} onChange={handleChange}>
                                <option value="">성별 선택</option>
                                <option value="남">남</option>
                                <option value="여">여</option>
                            </select>
                            <input name="weight" placeholder="몸무게 (kg)" type="number" step="0.1" value={form.weight} onChange={handleChange} />
                            <input name="description" placeholder="소개" value={form.description} onChange={handleChange} />
                            <label>
                                <input name="isNeutered" type="checkbox" checked={form.isNeutered} onChange={handleChange} />
                                {' '}중성화 여부
                            </label>
                            <button type="submit">등록</button>
                        </div>
                    </form>
                </div>
            )}

            {pets.length === 0 && !showForm && (
                <p style={{ color: '#888' }}>등록된 반려동물이 없어요. 반려동물을 등록해보세요! 🐾</p>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {pets.map((pet) => (
                    <div key={pet.id} style={{ border: '1px solid #ccc', borderRadius: '12px', padding: '16px', width: '200px' }}>
                        <div style={{ fontSize: '48px', textAlign: 'center' }}>
                            {pet.species === '강아지' ? '🐶' : pet.species === '고양이' ? '🐱' : '🐾'}
                        </div>
                        <h3 style={{ margin: '8px 0 4px' }}>{pet.name}</h3>
                        <p style={{ margin: '2px 0', fontSize: '14px' }}>{pet.species} {pet.breed && `· ${pet.breed}`}</p>
                        {pet.age && <p style={{ margin: '2px 0', fontSize: '14px' }}>{pet.age}살 {pet.gender && `· ${pet.gender}`}</p>}
                        {pet.weight && <p style={{ margin: '2px 0', fontSize: '14px' }}>{pet.weight}kg</p>}
                        {pet.isNeutered && <p style={{ margin: '2px 0', fontSize: '12px', color: '#888' }}>중성화 완료</p>}
                        {pet.description && <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#555' }}>{pet.description}</p>}
                        <button onClick={() => handleDelete(pet.id)} style={{ marginTop: '12px', width: '100%' }}>삭제</button>
                    </div>
                ))}
            </div>
        </div>
    );
}