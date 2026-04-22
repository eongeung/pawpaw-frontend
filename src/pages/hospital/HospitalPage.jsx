import { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { MapPin, Star, Phone } from 'lucide-react';

export default function HospitalPage() {
  const [query, setQuery] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: '', content: '' });
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (typeof window.kakao === 'undefined') return;

    const initMap = (lat, lng) => {
      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(lat, lng),
        level: 5,
      });
      mapInstanceRef.current = map;
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => initMap(pos.coords.latitude, pos.coords.longitude),
        () => initMap(37.5665, 126.9780)
      );
    } else {
      initMap(37.5665, 126.9780);
    }
  }, []);

  const handleSearch = async () => {
    const res = await axios.get(`/api/hospitals/search?query=${query}`);
    setHospitals(res.data);
    displayMarkers(res.data);
  };

  const displayMarkers = (hospitals) => {
    if (typeof window.kakao === 'undefined') return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const map = mapInstanceRef.current;
    const bounds = new window.kakao.maps.LatLngBounds();

    hospitals.forEach((hospital) => {
      const position = new window.kakao.maps.LatLng(hospital.lat, hospital.lng);
      const marker = new window.kakao.maps.Marker({
        position,
        map,
        title: hospital.name,
      });

      window.kakao.maps.event.addListener(marker, 'mouseover', () => {
        mapRef.current.style.cursor = 'pointer';
      });
      window.kakao.maps.event.addListener(marker, 'mouseout', () => {
        mapRef.current.style.cursor = '';
      });
      window.kakao.maps.event.addListener(marker, 'click', () => {
        handleSelectHospital(hospital);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    if (hospitals.length > 0) {
      map.setBounds(bounds);
    }
  };

  const handleSelectHospital = async (hospital) => {
    setSelectedHospital(hospital);
    const res = await axios.get(`/api/hospitals/${hospital.id}/reviews`);
    setReviews(res.data);

    if (mapInstanceRef.current && typeof window.kakao !== 'undefined') {
      mapInstanceRef.current.setCenter(
        new window.kakao.maps.LatLng(hospital.lat, hospital.lng)
      );
      mapInstanceRef.current.setLevel(2);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`/api/hospitals/${selectedHospital.id}/reviews`, {
      rating: Number(reviewForm.rating),
      content: reviewForm.content,
    });
    alert('리뷰 등록 완료!');
    const res = await axios.get(`/api/hospitals/${selectedHospital.id}/reviews`);
    setReviews(res.data);
    setReviewForm({ rating: '', content: '' });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">동물병원 찾기</h1>

      <div className="flex gap-3 mb-6">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="지역 검색 (예: 강남)"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 h-12"
        />
        <Button
          onClick={handleSearch}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 shadow-md hover:shadow-lg transition-all"
        >
          검색
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 지도 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden sticky top-[165px]">
            <div ref={mapRef} className="w-full h-[500px]" />
          </div>
        </div>

        {/* 병원 목록 */}
        <div className="lg:col-span-2 space-y-4">
          {hospitals.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <div className="text-6xl mb-4">🏥</div>
              <p className="text-gray-600">
                지역을 검색하여 동물병원을 찾아보세요
              </p>
            </div>
          )}
          {hospitals.map((h) => (
            <div
              key={h.id}
              onClick={() => handleSelectHospital(h)}
              className={`bg-white rounded-2xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-all ${
                selectedHospital?.id === h.id ? 'ring-2 ring-purple-400' : ''
              }`}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">{h.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  {h.address}
                </div>
                {h.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-purple-600" />
                    {h.phone}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 선택된 병원 리뷰 */}
      {selectedHospital && (
        <div className="mt-8 bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {selectedHospital.name} 리뷰
          </h2>

          {reviews.length === 0 && (
            <p className="text-gray-500 text-center py-8">아직 리뷰가 없어요</p>
          )}

          <div className="space-y-4 mb-8">
            {reviews.map((r) => (
              <div key={r.id} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-800">{r.nickname}</span>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-yellow-500" />
                    <span className="font-semibold">{r.rating}</span>
                  </div>
                </div>
                <p className="text-gray-700">{r.content}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">리뷰 작성</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rating">별점 (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  placeholder="별점 (1-5)"
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">리뷰 내용</Label>
                <Input
                  id="content"
                  placeholder="리뷰 내용"
                  value={reviewForm.content}
                  onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                  required
                  className="h-12"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 shadow-lg hover:shadow-xl transition-all"
              >
                리뷰 등록
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
