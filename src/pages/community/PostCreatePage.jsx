import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from '../../api/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, ImagePlus, X } from 'lucide-react';

export default function PostCreatePage() {
  const [form, setForm] = useState({ category: '', title: '', content: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (value) => {
    setForm({ ...form, category: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('category', form.category);
    formData.append('title', form.title);
    formData.append('content', form.content);
    if (imageFile) formData.append('image', imageFile);
    await axios.post('/api/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    alert('작성 완료!');
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Button
        onClick={() => navigate('/')}
        variant="ghost"
        className="mb-6 hover:bg-purple-50"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        목록으로
      </Button>

      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">글쓰기</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category">카테고리</Label>
            <Select onValueChange={handleCategoryChange} required>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="자랑">자랑</SelectItem>
                <SelectItem value="고민">고민</SelectItem>
                <SelectItem value="정보">정보</SelectItem>
                <SelectItem value="질문">질문</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              name="title"
              placeholder="제목을 입력하세요"
              value={form.title}
              onChange={handleChange}
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">내용</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="내용을 입력하세요"
              value={form.content}
              onChange={handleChange}
              required
              rows={10}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>이미지 첨부</Label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="미리보기"
                  className="w-full max-h-64 object-cover rounded-xl border border-gray-200"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-200 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors">
                <ImagePlus className="w-8 h-8 text-purple-400 mb-2" />
                <span className="text-sm text-gray-500">클릭하여 이미지 추가</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              등록
            </Button>
            <Button
              type="button"
              onClick={() => navigate('/')}
              variant="outline"
              className="flex-1 border-purple-300 text-purple-600 hover:bg-purple-50 py-6 rounded-xl"
            >
              취소
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
