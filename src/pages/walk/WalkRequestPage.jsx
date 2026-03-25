import { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';

export default function WalkRequestPage() {
    const [requests, setRequests] = useState([]);
    const [pets, setPets] = useState([]);
    const [form, setForm] = useState({
        title: '', content: '', petId: '',
        walkDate: '', startTime: '', endTime: '',
        reward: '', location: ''
    });
    const [showMap, setShowMap] = useState(false);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        axios.get('/api/walk-requests').then((res) => setRequests(res.data));
        axios.get('/api/pets/my').then((res) => setPets(res.data));
    }, []);

    useEffect(() => {
        if (!showMap) return;

        setTimeout(() => {
            const map = new window.naver.maps.Map(mapRef.current, {
                center: new window.naver.maps.LatLng(37.5665, 126.9780),
                zoom: 14,
            });
            mapInstanceRef.current = map;

            window.naver.maps.Event.addListener(map, 'click', (e) => {
                const lat = e.coord.lat();
                const lng = e.coord.lng();

                if (markerRef.current) markerRef.current.setMap(null);
                markerRef.current = new window.naver.maps.Marker({
                    position: e.coord,
                    map,
                });

                // 좌표 → 주소 변환
                window.naver.maps.Service.reverseGeocode(
                    { coords: new window.naver.maps.LatLng(lat, lng) },
                    (status, response) => {
                        if (status === window.naver.maps.Service.Status.OK) {
                            const address = response.v2.address.jibunAddress || response.v2.address.roadAddress;
                            setForm((prev) => ({ ...prev, location: address }));
                            setShowMap(false);
                        }
                    }
                );
            });
        }, 100);
    }, [showMap]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await axios.post('/api/walk-requests', {
            ...form,
            petId: Number(form.petId)
        });
        setRequests([res.data, ...requests]);
        alert('등록 완료!');
    };

    return (
        <div>
            <h2>산책 매칭</h2>
            <form onSubmit={handleSubmit}>
                <input name="title" placeholder="제목" onChange={handleChange} />
                <input name="content" placeholder="내용" onChange={handleChange} />

                <select name="petId" onChange={handleChange}>
                    <option value="">반려동물 선택</option>
                    {pets.map((pet) => (
                        <option key={pet.id} value={pet.id}>
                            {pet.name} ({pet.species})
                        </option>
                    ))}
                </select>

                <input name="walkDate" type="date" onChange={handleChange} />
                <input name="startTime" type="time" onChange={handleChange} />
                <input name="endTime" type="time" onChange={handleChange} />
                <input name="reward" placeholder="보수" onChange={handleChange} />

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                        name="location"
                        placeholder="위치"
                        value={form.location}
                        onChange={handleChange}
                        readOnly
                    />
                    <button type="button" onClick={() => setShowMap(true)}>지도 선택</button>
                </div>

                <button type="submit">등록</button>
            </form>

            {showMap && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 999 }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '500px', background: '#fff' }}>
                        <p style={{ padding: '8px', margin: 0 }}>📍 지도에서 위치를 클릭하세요</p>
                        <button onClick={() => setShowMap(false)} style={{ position: 'absolute', top: '8px', right: '8px' }}>닫기</button>
                        <div ref={mapRef} style={{ width: '100%', height: '450px' }} />
                    </div>
                </div>
            )}

            <hr />
            {requests.map((r) => (
                <div key={r.id}>
                    <h4>{r.title}</h4>
                    <p>{r.location} | {r.reward} | {r.status}</p>
                </div>
            ))}
        </div>
    );
}