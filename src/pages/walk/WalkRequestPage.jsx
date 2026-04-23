import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import useAuthStore from '../../store/authStore';
import axios from '../../api/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Plus, MessageCircle, MapPin, Calendar, Clock } from 'lucide-react';

const TODAY = new Date().toISOString().split('T')[0];

const formatTime = (time) => (time ? time.slice(0, 5) : '');

export default function WalkRequestPage() {
  const [requests, setRequests] = useState([]);
  const [pets, setPets] = useState([]);
  const [form, setForm] = useState({
    title: '', content: '', petId: '',
    walkDate: '', startTime: '', endTime: '',
    reward: '', location: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const navigate = useNavigate();
  const userId = useAuthStore((state) => state.userId);

  useEffect(() => {
    axios.get('/api/walk-requests').then((res) => setRequests(res.data));
    axios.get('/api/pets/my').then((res) => setPets(res.data));
  }, []);

  useEffect(() => {
    if (!showMap) return;

    setTimeout(() => {
      if (typeof window.kakao === 'undefined') {
        alert('카카오 지도 API를 사용할 수 없습니다.');
        setShowMap(false);
        return;
      }

      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 4,
      });
      mapInstanceRef.current = map;

      const geocoder = new window.kakao.maps.services.Geocoder();

      window.kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
        const latLng = mouseEvent.latLng;

        if (markerRef.current) markerRef.current.setMap(null);
        markerRef.current = new window.kakao.maps.Marker({
          position: latLng,
          map,
        });

        geocoder.coord2Address(latLng.getLng(), latLng.getLat(), (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const address = result[0].road_address?.address_name || result[0].address.address_name;
            setForm((prev) => ({ ...prev, location: address }));
            setShowMap(false);
          }
        });
      });
    }, 100);
  }, [showMap]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePetChange = (value) => {
    setForm({ ...form, petId: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post('/api/walk-requests', {
      ...form,
      petId: Number(form.petId)
    });
    setRequests([res.data, ...requests]);
    setForm({
      title: '', content: '', petId: '',
      walkDate: '', startTime: '', endTime: '',
      reward: '', location: ''
    });
    setShowForm(false);
    alert('등록 완료!');
  };

  const handleChat = async (request) => {
    try {
      const res = await axios.post(`/api/chat/rooms?walkRequestId=${request.id}&receiverId=${request.userId}`);
      navigate('/chat', { state: { roomId: res.data.id } });
    } catch (err) {
      if (err.response?.data?.includes('이미 존재하는')) {
        navigate('/chat');
      } else {
        alert('채팅방 생성 실패');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">산책 매칭</h1>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          새 매칭 등록
        </Button>
      </div>

      {/* 산책 요청 목록 */}
      <div className="space-y-4">
        {requests.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">🐾</div>
            <p className="text-gray-600">아직 산책 요청이 없어요.</p>
          </div>
        )}
        {requests.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold text-gray-800 mb-3">{r.title}</h3>
            <p className="text-gray-700 mb-4">{r.content}</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-semibold text-purple-600">{r.nickname}</span>
                <span>·</span>
                <span>{r.petName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-purple-600" />
                {r.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-purple-600" />
                {r.walkDate}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-purple-600" />
                {formatTime(r.startTime)} ~ {formatTime(r.endTime)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-600 font-semibold">{r.reward}</span>
              {r.userId !== userId && (
                <Button
                  onClick={() => handleChat(r)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  채팅하기
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 새 매칭 등록 모달 */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>산책 요청 등록</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                name="title"
                placeholder="제목"
                value={form.title}
                onChange={handleChange}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="내용"
                value={form.content}
                onChange={handleChange}
                required
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>반려동물</Label>
              <Select onValueChange={handlePetChange} required>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="반려동물 선택" />
                </SelectTrigger>
                <SelectContent>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={String(pet.id)}>
                      {pet.name} ({pet.species})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="walkDate">산책 날짜</Label>
              <Input
                id="walkDate"
                name="walkDate"
                type="date"
                min={TODAY}
                value={form.walkDate}
                onChange={handleChange}
                required
                className="h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startTime">시작 시간</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={handleChange}
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">종료 시간</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={handleChange}
                  required
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward">알바비</Label>
              <div className="relative">
                <Input
                  id="reward"
                  name="reward"
                  placeholder="예: 10,000"
                  value={form.reward}
                  onChange={handleChange}
                  required
                  className="h-10 pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">원</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>위치</Label>
              <div className="flex gap-2">
                <Input
                  name="location"
                  placeholder="위치"
                  value={form.location}
                  readOnly
                  required
                  className="h-10 flex-1"
                />
                <Button
                  type="button"
                  onClick={() => setShowMap(true)}
                  variant="outline"
                  className="border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  <MapPin className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              등록
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* 지도 모달 */}
      <Dialog open={showMap} onOpenChange={setShowMap}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>📍 지도에서 위치를 클릭하세요</DialogTitle>
          </DialogHeader>
          <div ref={mapRef} className="w-full h-[500px] rounded-xl" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
