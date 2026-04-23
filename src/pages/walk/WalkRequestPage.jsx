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
import { Plus, MessageCircle, MapPin, Calendar, Clock, Search } from 'lucide-react';

const TODAY = new Date().toISOString().split('T')[0];

const getNowTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

export default function WalkRequestPage() {
  const [requests, setRequests] = useState([]);
  const [pets, setPets] = useState([]);
  const [form, setForm] = useState({
    title: '', content: '', petId: '',
    walkDate: '', startTime: '', endTime: '',
    reward: '', location: ''
  });
  const [showMap, setShowMap] = useState(false);
  const [mapQuery, setMapQuery] = useState('');
  const [pendingAddress, setPendingAddress] = useState('');
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const placesRef = useRef(null);
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

      const kakao = window.kakao;
      const map = new kakao.maps.Map(mapRef.current, {
        center: new kakao.maps.LatLng(37.5665, 126.9780),
        level: 5,
      });
      mapInstanceRef.current = map;
      geocoderRef.current = new kakao.maps.services.Geocoder();
      placesRef.current = new kakao.maps.services.Places();

      kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
        const latlng = mouseEvent.latLng;

        if (markerRef.current) markerRef.current.setMap(null);
        markerRef.current = new kakao.maps.Marker({ position: latlng, map });

        geocoderRef.current.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
          if (status === kakao.maps.services.Status.OK) {
            const addr = result[0].road_address?.address_name || result[0].address.address_name;
            setPendingAddress(addr);
          }
        });
      });
    }, 100);
  }, [showMap]);

  const handleMapSearch = () => {
    if (!mapQuery.trim() || !placesRef.current) return;
    const kakao = window.kakao;

    placesRef.current.keywordSearch(mapQuery, (data, status) => {
      if (status !== kakao.maps.services.Status.OK) {
        alert('검색 결과가 없습니다.');
        return;
      }
      const place = data[0];
      const latlng = new kakao.maps.LatLng(place.y, place.x);

      mapInstanceRef.current.setCenter(latlng);
      mapInstanceRef.current.setLevel(4);

      if (markerRef.current) markerRef.current.setMap(null);
      markerRef.current = new kakao.maps.Marker({ position: latlng, map: mapInstanceRef.current });

      setPendingAddress(place.road_address_name || place.address_name);
    });
  };

  const handleMapConfirm = () => {
    if (!pendingAddress) {
      alert('지도에서 위치를 선택해주세요.');
      return;
    }
    setForm((prev) => ({ ...prev, location: pendingAddress }));
    setShowMap(false);
    setPendingAddress('');
    setMapQuery('');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setForm((prev) => ({
      ...prev,
      walkDate: newDate,
      startTime: newDate === TODAY && prev.startTime < getNowTime() ? '' : prev.startTime,
      endTime: newDate === TODAY && prev.startTime < getNowTime() ? '' : prev.endTime,
    }));
  };

  const handleStartTimeChange = (e) => {
    const newStart = e.target.value;
    setForm((prev) => ({
      ...prev,
      startTime: newStart,
      endTime: prev.endTime && prev.endTime <= newStart ? '' : prev.endTime,
    }));
  };

  const handlePetChange = (value) => {
    setForm({ ...form, petId: value });
  };

  const handleRewardChange = (e) => {
    const digits = e.target.value.replace(/[^0-9]/g, '');
    if (!digits) {
      setForm({ ...form, reward: '' });
      return;
    }
    setForm({ ...form, reward: Number(digits).toLocaleString('ko-KR') + '원' });
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
    alert('등록 완료!');
  };

  const handleChat = async (request) => {
    try {
      const res = await axios.post(`/api/chat/rooms?walkRequestId=${request.id}&receiverId=${request.userId}`);
      navigate('/chat', { state: { roomId: res.data.id } });
    } catch (err) {
      alert('이미 채팅방이 만들어져 있습니다.');
      navigate('/chat');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">산책 매칭</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-[165px]">
            <h2 className="text-xl font-bold text-gray-800 mb-4">산책 요청 등록</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="petId">반려동물</Label>
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
                  value={form.walkDate}
                  onChange={handleDateChange}
                  min={TODAY}
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
                    onChange={handleStartTimeChange}
                    min={form.walkDate === TODAY ? getNowTime() : undefined}
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
                    min={form.startTime || undefined}
                    required
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reward">알바비</Label>
                <Input
                  id="reward"
                  name="reward"
                  placeholder="예: 10,000원"
                  value={form.reward}
                  onChange={handleRewardChange}
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">위치</Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
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
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-800">산책 요청 목록</h2>
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
                  {r.startTime} ~ {r.endTime}
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
      </div>

      <Dialog open={showMap} onOpenChange={(open) => { if (!open) { setPendingAddress(''); setMapQuery(''); } setShowMap(open); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>📍 위치 선택</DialogTitle>
          </DialogHeader>

          <div className="flex gap-2 mb-3">
            <Input
              placeholder="장소 또는 주소 검색"
              value={mapQuery}
              onChange={(e) => setMapQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && handleMapSearch()}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleMapSearch}
              variant="outline"
              className="border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>

          <div ref={mapRef} className="w-full h-[420px] rounded-xl" />

          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-gray-500 truncate flex-1 mr-4">
              {pendingAddress ? `📍 ${pendingAddress}` : '지도를 클릭하거나 검색해서 위치를 선택하세요'}
            </p>
            <Button
              type="button"
              onClick={handleMapConfirm}
              disabled={!pendingAddress}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full px-6 disabled:opacity-40"
            >
              선택 완료
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
