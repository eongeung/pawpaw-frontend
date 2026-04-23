import { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { MapPin, Star, Phone, Loader2 } from 'lucide-react';

function StarRating({ value, onChange, readonly = false, size = 'md' }) {
  const [hovered, setHovered] = useState(0);
  const sz = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sz} cursor-${readonly ? 'default' : 'pointer'} transition-colors ${
            star <= (hovered || value)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => !readonly && onChange?.(star)}
        />
      ))}
    </div>
  );
}

export default function HospitalPage() {
  const [query, setQuery] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [reviews, setReviews] = useState({});
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 0, content: '' });
  const [gpsLoading, setGpsLoading] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    const initMap = (lat = 37.5665, lng = 126.9780) => {
      if (typeof window.kakao === 'undefined' || !mapRef.current) return null;
      const kakao = window.kakao;
      const map = new kakao.maps.Map(mapRef.current, {
        center: new kakao.maps.LatLng(lat, lng),
        level: 5,
      });
      mapInstanceRef.current = map;
      return map;
    };

    const map = initMap();
    if (!map) return;

    if (!navigator.geolocation) return;

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const kakao = window.kakao;
        const userLatLng = new kakao.maps.LatLng(lat, lng);
        map.setCenter(userLatLng);
        map.setLevel(4);

        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.coord2RegionCode(lng, lat, (result, status) => {
          setGpsLoading(false);
          if (status === kakao.maps.services.Status.OK) {
            const region = result[0].region_2depth_name || result[0].region_1depth_name;
            setQuery(region);
            fetchHospitals(region);
          }
        });
      },
      () => setGpsLoading(false)
    );
  }, []);

  const fetchHospitals = async (q) => {
    const res = await axios.get(`/api/hospitals/search?query=${q}`);
    setHospitals(res.data);
    displayMarkers(res.data);
    res.data.forEach((h) => loadReviews(h.id));
  };

  const loadReviews = async (hospitalId) => {
    const res = await axios.get(`/api/hospitals/${hospitalId}/reviews`);
    setReviews((prev) => ({ ...prev, [hospitalId]: res.data }));
  };

  const displayMarkers = (list) => {
    if (typeof window.kakao === 'undefined') return;
    const kakao = window.kakao;
    const map = mapInstanceRef.current;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (list.length === 0) return;

    const bounds = new kakao.maps.LatLngBounds();

    list.forEach((hospital) => {
      const position = new kakao.maps.LatLng(hospital.lat, hospital.lng);
      const marker = new kakao.maps.Marker({ position, map, title: hospital.name });

      kakao.maps.event.addListener(marker, 'click', () => handleSelectHospital(hospital));
      kakao.maps.event.addListener(marker, 'mouseover', () => {
        marker.getMap()?.setCursor('pointer');
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    map.setBounds(bounds);
  };

  const handleSelectHospital = async (hospital) => {
    setSelectedHospital(hospital);
    if (!reviews[hospital.id]) await loadReviews(hospital.id);

    if (mapInstanceRef.current) {
      const kakao = window.kakao;
      mapInstanceRef.current.setCenter(new kakao.maps.LatLng(hospital.lat, hospital.lng));
      mapInstanceRef.current.setLevel(4);
    }
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    fetchHospitals(query);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.rating) { alert('별점을 선택해주세요.'); return; }
    await axios.post(`/api/hospitals/${selectedHospital.id}/reviews`, {
      rating: reviewForm.rating,
      content: reviewForm.content,
    });
    await loadReviews(selectedHospital.id);
    setReviewForm({ rating: 0, content: '' });
  };

  const ORDINALS = ['', '', '두번째', '세번째', '네번째', '다섯번째', '여섯번째', '일곱번째', '여덟번째', '아홉번째', '열번째'];

  const getReviewsWithOrdinal = (hospitalId) => {
    const list = reviews[hospitalId] || [];
    const counts = {};
    return list.map((r) => {
      counts[r.nickname] = (counts[r.nickname] || 0) + 1;
      const label = counts[r.nickname] >= 2 ? (ORDINALS[counts[r.nickname]] ?? `${counts[r.nickname]}번째`) + ' 리뷰' : null;
      return { ...r, visitLabel: label };
    });
  };

  const getAvgRating = (hospitalId) => {
    const list = reviews[hospitalId];
    if (!list || list.length === 0) return null;
    const avg = list.reduce((sum, r) => sum + r.rating, 0) / list.length;
    return { avg: avg.toFixed(1), count: list.length };
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">가까운 동물병원</h1>

      <div className="flex gap-3 mb-6">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="지역 검색 (예: 강남)"
          onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && handleSearch()}
          className="flex-1 h-12"
        />
        <Button
          onClick={handleSearch}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 shadow-md hover:shadow-lg transition-all"
        >
          {gpsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '검색'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden sticky top-[165px]">
            {gpsLoading && (
              <div className="flex items-center justify-center gap-2 py-3 text-sm text-purple-600 bg-purple-50 border-b border-purple-100">
                <Loader2 className="w-4 h-4 animate-spin" />
                내 위치 찾는 중...
              </div>
            )}
            <div ref={mapRef} className="w-full h-[460px]" />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {hospitals.length === 0 && !gpsLoading && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <div className="text-6xl mb-4">🏥</div>
              <p className="text-gray-600">지역을 검색하여 동물병원을 찾아보세요</p>
            </div>
          )}
          {hospitals.map((h) => {
            const rating = getAvgRating(h.id);
            const isSelected = selectedHospital?.id === h.id;
            const hospitalReviews = reviews[h.id] || [];

            return (
              <div
                key={h.id}
                className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all ${
                  isSelected ? 'ring-2 ring-purple-400' : 'hover:shadow-md'
                }`}
              >
                <div
                  onClick={() => handleSelectHospital(h)}
                  className="p-6 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{h.name}</h3>
                    {rating && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 shrink-0 ml-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-700">{rating.avg}</span>
                        <span>({rating.count})</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
                      {h.address}
                    </div>
                    {h.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-purple-600 shrink-0" />
                        <a
                          href={`tel:${h.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-purple-600 hover:underline"
                        >
                          {h.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div className="border-t border-gray-100 px-6 pb-6">
                    {hospitalReviews.length > 0 && (
                      <div className={`mt-4 space-y-3 ${hospitalReviews.length >= 6 ? 'max-h-[400px] overflow-y-auto pr-1' : ''}`}>
                        {getReviewsWithOrdinal(h.id).map((r) => (
                          <div key={r.id} className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-gray-800">{r.nickname}</span>
                              {r.visitLabel && (
                                <span className="text-xs text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded-full">
                                  {r.visitLabel}
                                </span>
                              )}
                              <StarRating value={r.rating} readonly size="sm" />
                            </div>
                            <p className="text-sm text-gray-700">{r.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <form onSubmit={handleReviewSubmit} className="mt-4 space-y-3">
                      <p className="text-sm font-semibold text-gray-700">리뷰 작성</p>
                      <StarRating
                        value={reviewForm.rating}
                        onChange={(v) => setReviewForm({ ...reviewForm, rating: v })}
                      />
                      <Input
                        placeholder="리뷰 내용을 입력하세요"
                        value={reviewForm.content}
                        onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                        required
                        className="h-10"
                      />
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                      >
                        등록
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
