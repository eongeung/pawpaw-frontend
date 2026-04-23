import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import useAuthStore from '../../store/authStore';
import axios from '../../api/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Send } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">채팅방</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
        {/* Chat Room List */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">대화 목록</h2>
          </div>
          <div className="overflow-y-auto h-full">
            {chatRooms.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-gray-600">아직 채팅방이 없어요</p>
              </div>
            )}
            {chatRooms.map((room) => {
              const otherNickname = room.requesterId === userId
                ? room.receiverNickname
                : room.requesterNickname;
              return (
                <button
                  key={room.id}
                  onClick={() => handleSelectRoom(room)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-purple-50 transition-colors border-b border-gray-50 text-left ${
                    selectedRoom?.id === room.id ? 'bg-purple-50' : ''
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                    🐶
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{otherNickname}</h3>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Messages */}
        {selectedRoom ? (
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-lg flex-shrink-0 shadow-sm">
                🐶
              </div>
              <h2 className="font-semibold text-gray-800">
                {selectedRoom.requesterId === userId
                  ? selectedRoom.receiverNickname
                  : selectedRoom.requesterNickname}
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-purple-50/30 to-indigo-50/30">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 ${
                    msg.senderId === userId ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className="text-2xl flex-shrink-0">
                    {msg.senderId === userId ? '👤' : '🐾'}
                  </div>
                  <div
                    className={`flex flex-col ${
                      msg.senderId === userId ? 'items-end' : 'items-start'
                    }`}
                  >
                    {msg.senderId !== userId && (
                      <span className="text-xs text-gray-500 mb-1">
                        {msg.senderNickname}
                      </span>
                    )}
                    <div
                      className={`px-4 py-3 rounded-2xl max-w-md ${
                        msg.senderId === userId
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                          : 'bg-white shadow-sm'
                      }`}
                    >
                      <p
                        className={
                          msg.senderId === userId ? 'text-white' : 'text-gray-800'
                        }
                      >
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex gap-3">
                <Input
                  placeholder="메시지 입력"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && handleSend()}
                  className="flex-1 rounded-full border-purple-200 focus:border-purple-400"
                />
                <Button
                  onClick={handleSend}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full px-6 shadow-md hover:shadow-lg transition-all"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-600">채팅방을 선택해주세요</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
