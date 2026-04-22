import { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { MapPin, Star, Phone } from 'lucide-react';

const ORDINALS = ['', '', '두번째', '세번째', '네번째', '다섯번째'];
const getOrdinalLabel = (n) =>
  n > 1 ? `${ORDINALS[n] || `${n}번째`} 리뷰` : null;

export default function HospitalPage() {
  const [query, setQuery] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [reviewContent, setReviewContent] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const displayMarkers = (hospitalList) => {
    if (!mapInstanceRef.current || typeof window.kakao === 'undefined') return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const map = mapInstanceRef.current;
    const bounds = new window.kakao.maps.LatLngBounds();

    hospitalList.forEach((hospital) => {
      const position = new window.kakao.maps.LatLng(hospital.lat, hospital.lng);
      const marker = new window.kakao.maps.Marker({ position, map, title: hospital.name });

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

    if (hospitalList.length > 0) map.setBounds(bounds);
  };

  const fetchHospitals = async (searchQuery) => {
    try {
      const res = await axios.get(`/api/hospitals/search?query=${searchQuery}`);
      setHospitals(res.data);
      displayMarkers(res.data);
    } catch (_) {}
  };

  useEffect(() => {
    if (typeof window.kakao === 'undefined') return;

    const initMap = (lat, lng) => {
      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(lat, lng),
        level: 5,
      });
      mapInstanceRef.current = map;

      // GPS 위치 기반 지역명으로 자동 검색
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.coord2RegionCode(lng, lat, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const region = result.find((r) => r.region_type === 'H') || result[0];
          const regionName = region.region_2depth_name || region.region_1depth_name;
          setQuery(regionName);
          fetchHospitals(regionName);
        }
      });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => initMap(pos.coords.latitude, pos.coords.longitude),
        () => initMap(37.5665, 126.9780)
      );
    } else {
      initMap(37.5665, 126.9780);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => fetchHospitals(query);

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
    if (rating === 0) {
      alert('별점을 선택해주세요.');
      return;
    }
    await axios.post(`/api/hospitals/${selectedHospital.id}/reviews`, {
      rating,
      content: reviewContent,
    });
    alert('리뷰 등록 완료!');
    const res = await axios.get(`/api/hospitals/${selectedHospital.id}/reviews`);
    setReviews(res.data);
    setReviewContent('');
    setRating(0);
  };

  // 닉네임별 방문 횟수 계산 → 두번째 리뷰 라벨
  const reviewsWithOrdinal = reviews.reduce((acc, r) => {
    const counts = { ...acc.counts, [r.nickname]: (acc.counts[r.nickname] || 0) + 1 };
    return {
      counts,
      list: [...acc.list, { ...r, visitLabel: getOrdinalLabel(counts[r.nickname]) }],
    };
  }, { counts: {}, list: [] }).list;

  const StarRow = ({ value, interactive = false }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = interactive ? (hoverRating || rating) >= s : value >= s;
        return (
          <Star
            key={s}
            className={`w-5 h-5 transition-colors ${
              filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'cursor-pointer' : ''}`}
            onClick={interactive ? () => setRating(s) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(s) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          />
        );
      })}
    </div>
  );

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
              <p className="text-gray-600">지역을 검색하여 동물병원을 찾아보세요</p>
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
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
                    {h.address}
                  </div>
                </div>
                {h.phone && (
                  <a
                    href={`tel:${h.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-300 text-purple-600 hover:bg-purple-50"
                    >
                      <Phone className="w-4 h-4 mr-1.5" />
                      전화하기
                    </Button>
                  </a>
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

          {reviewsWithOrdinal.length === 0 && (
            <p className="text-gray-500 text-center py-8">아직 리뷰가 없어요</p>
          )}

          <div className="space-y-4 mb-8">
            {reviewsWithOrdinal.map((r) => (
              <div key={r.id} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-800">{r.nickname}</span>
                  {r.visitLabel && (
                    <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
                      {r.visitLabel}
                    </span>
                  )}
                  <StarRow value={r.rating} />
                </div>
                <p className="text-gray-700 mt-1">{r.content}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">리뷰 작성</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>별점</Label>
                <StarRow value={rating} interactive />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reviewContent">리뷰 내용</Label>
                <Textarea
                  id="reviewContent"
                  placeholder="방문 후기를 작성해주세요"
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  required
                  rows={3}
                  className="resize-none"
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
