import { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';

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
        // 지도 초기화
        const map = new window.naver.maps.Map(mapRef.current, {
            center: new window.naver.maps.LatLng(37.5665, 126.9780),
            zoom: 13,
        });
        mapInstanceRef.current = map;
    }, []);

    const handleSearch = async () => {
        const res = await axios.get(`/api/hospitals/search?query=${query}`);
        setHospitals(res.data);
        displayMarkers(res.data);
    };

    const displayMarkers = (hospitals) => {
        // 기존 마커 제거
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        const map = mapInstanceRef.current;
        const bounds = new window.naver.maps.LatLngBounds();

        hospitals.forEach((hospital) => {
            const position = new window.naver.maps.LatLng(hospital.lat, hospital.lng);
            const marker = new window.naver.maps.Marker({
                position,
                map,
                title: hospital.name,
            });

            // 마커 클릭 시 병원 선택
            window.naver.maps.Event.addListener(marker, 'click', () => {
                handleSelectHospital(hospital);
            });

            markersRef.current.push(marker);
            bounds.extend(position);
        });

        if (hospitals.length > 0) {
            map.fitBounds(bounds);
        }
    };

    const handleSelectHospital = async (hospital) => {
        setSelectedHospital(hospital);
        const res = await axios.get(`/api/hospitals/${hospital.id}/reviews`);
        setReviews(res.data);

        // 선택한 병원으로 지도 이동
        mapInstanceRef.current.setCenter(
            new window.naver.maps.LatLng(hospital.lat, hospital.lng)
        );
        mapInstanceRef.current.setZoom(16);
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
    };

    return (
        <div>
            <h2>동물병원 찾기</h2>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="지역 검색 (예: 강남)"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch}>검색</button>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
                {/* 지도 */}
                <div ref={mapRef} style={{ width: '500px', height: '500px', flexShrink: 0 }} />

                {/* 병원 목록 */}
                <div style={{ flex: 1, overflowY: 'auto', maxHeight: '500px' }}>
                    {hospitals.map((h) => (
                        <div
                            key={h.id}
                            onClick={() => handleSelectHospital(h)}
                            style={{
                                cursor: 'pointer',
                                padding: '8px',
                                borderBottom: '1px solid #ccc',
                                background: selectedHospital?.id === h.id ? '#f0f0f0' : 'transparent'
                            }}
                        >
                            <h4 style={{ margin: 0 }}>{h.name}</h4>
                            <p style={{ margin: 0, fontSize: '12px' }}>{h.address}</p>
                            {h.phone && <p style={{ margin: 0, fontSize: '12px' }}>{h.phone}</p>}
                        </div>
                    ))}
                </div>
            </div>

            {/* 선택된 병원 리뷰 */}
            {selectedHospital && (
                <div style={{ marginTop: '24px' }}>
                    <h3>{selectedHospital.name} 리뷰</h3>
                    {reviews.length === 0 && <p>아직 리뷰가 없어요</p>}
                    {reviews.map((r) => (
                        <div key={r.id}>
                            <b>{r.nickname}</b> ⭐{r.rating} - {r.content}
                        </div>
                    ))}
                    <form onSubmit={handleReviewSubmit}>
                        <input
                            placeholder="별점 (1-5)"
                            onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                        />
                        <input
                            placeholder="리뷰 내용"
                            onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                        />
                        <button type="submit">리뷰 등록</button>
                    </form>
                </div>
            )}
        </div>
    );
}