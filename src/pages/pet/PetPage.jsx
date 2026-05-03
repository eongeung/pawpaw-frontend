import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';

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

  const handleSpeciesChange = (value) => {
    setForm({ ...form, species: value });
  };

  const handleGenderChange = (value) => {
    setForm({ ...form, gender: value });
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
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">내 반려동물</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          {showForm ? '닫기' : '반려동물 등록'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">반려동물 등록</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="이름"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="species">종류 *</Label>
                <Select onValueChange={handleSpeciesChange} required>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="종류 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="강아지">강아지</SelectItem>
                    <SelectItem value="고양이">고양이</SelectItem>
                    <SelectItem value="기타">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="breed">품종</Label>
                <Input
                  id="breed"
                  name="breed"
                  placeholder="품종"
                  value={form.breed}
                  onChange={handleChange}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">나이</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  min="0"
                  placeholder="나이"
                  value={form.age}
                  onChange={handleChange}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">성별</Label>
                <Select onValueChange={handleGenderChange}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="성별 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="남">남</SelectItem>
                    <SelectItem value="여">여</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">몸무게 (kg)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.1"
                  placeholder="몸무게"
                  value={form.weight}
                  onChange={handleChange}
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">소개</Label>
              <Input
                id="description"
                name="description"
                placeholder="소개"
                value={form.description}
                onChange={handleChange}
                className="h-12"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isNeutered"
                name="isNeutered"
                checked={form.isNeutered}
                onCheckedChange={(checked) => setForm({ ...form, isNeutered: checked })}
              />
              <Label htmlFor="isNeutered" className="cursor-pointer">
                중성화 여부
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 shadow-lg hover:shadow-xl transition-all"
            >
              등록
            </Button>
          </form>
        </div>
      )}

      {pets.length === 0 && !showForm && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
          <div className="text-6xl mb-4">🐾</div>
          <p className="text-gray-600">
            등록된 반려동물이 없어요. 반려동물을 등록해보세요!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet) => (
          <div key={pet.id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-6xl text-center mb-4">
              {pet.species === '강아지' ? '🐶' : pet.species === '고양이' ? '🐱' : '🐾'}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{pet.name}</h3>
            <div className="space-y-1 text-sm text-gray-600 mb-4">
              <p>{pet.species} {pet.breed && `· ${pet.breed}`}</p>
              {pet.age && <p>{pet.age}살 {pet.gender && `· ${pet.gender}`}</p>}
              {pet.weight && <p>{pet.weight}kg</p>}
              {pet.isNeutered && (
                <p className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full inline-block">
                  중성화 완료
                </p>
              )}
            </div>
            {pet.description && (
              <p className="text-sm text-gray-700 mb-4 p-3 bg-gray-50 rounded-xl">
                {pet.description}
              </p>
            )}
            <Button
              onClick={() => handleDelete(pet.id)}
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              삭제
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
