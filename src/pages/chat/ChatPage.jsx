import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import useAuthStore from '../../store/authStore';
import axios from '../../api/axios';

export default function ChatPage() {
    const [chatRooms, setChatRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const clientRef = useRef(null);
    const userId = useAuthStore((state) => state.userId);

    useEffect(() => {
        axios.get('/api/chat/rooms').then((res) => setChatRooms(res.data));
    }, []);

    const connectWebSocket = (roomId) => {
        const token = localStorage.getItem('accessToken');
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            onConnect: () => {
                console.log('WebSocket 연결됨');
                client.subscribe(`/sub/chat/room/${roomId}`, (message) => {
                    console.log('메시지 수신:', message.body);
                    const received = JSON.parse(message.body);
                    setMessages((prev) => [...prev, received]);
                });
            },
        });
        client.activate();
        clientRef.current = client;
    };

    const handleSelectRoom = async (room) => {
        setSelectedRoom(room);
        const res = await axios.get(`/api/chat/rooms/${room.id}/messages`);
        setMessages(res.data);
        if (clientRef.current) clientRef.current.deactivate();
        connectWebSocket(room.id);
    };

    const handleSend = () => {
        if (!content.trim()) return;
        clientRef.current.publish({
            destination: '/pub/chat/message',
            body: JSON.stringify({ roomId: selectedRoom.id, content, senderId: userId }),
        });
        setContent('');
    };

    return (
        <div style={{ display: 'flex' }}>
            <div style={{ width: '200px', borderRight: '1px solid #ccc' }}>
                <h3>채팅방</h3>
                {chatRooms.map((room) => (
                    <div key={room.id} onClick={() => handleSelectRoom(room)} style={{ cursor: 'pointer', padding: '8px' }}>
                        {room.requesterNickname} - {room.receiverNickname}
                    </div>
                ))}
            </div>
            {selectedRoom && (
                <div style={{ flex: 1, padding: '16px' }}>
                    <h3>채팅</h3>
                    <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '8px' }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{ marginBottom: '8px', textAlign: m.senderId === userId ? 'right' : 'left' }}>
                                <span style={{ fontSize: '12px', color: '#888' }}>{m.senderNickname}</span>
                                <div>{m.content}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <input
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="메시지 입력"
                            style={{ flex: 1 }}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend}>전송</button>
                    </div>
                </div>
            )}
        </div>
    );
}