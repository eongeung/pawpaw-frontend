import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from '../../api/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Pencil, MapPin, Mail, Calendar, FileText, Footprints, ChevronRight } from 'lucide-react';

const TABS = [
  { key: 'posts', label: '작성한 글', icon: FileText },
  { key: 'walks', label: '산책 매칭', icon: Footprints },
];

export default function MyPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [myWalks, setMyWalks] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ nickname: '', address: '' });

  useEffect(() => {
    axios.get('/api/users/me').then((res) => {
      setUser(res.data);
      setEditForm({ nickname: res.data.nickname ?? '', address: res.data.address ?? '' });
    });
    axios.get('/api/posts/my').then((res) => setMyPosts(res.data));
    axios.get('/api/walk-requests/my').then((res) => setMyWalks(res.data)).catch(() => {});
  }, []);

  const handleGpsAddress = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      if (typeof window.kakao === 'undefined') return;
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.coord2RegionCode(lng, lat, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const r = result[0];
          const addr = `${r.region_1depth_name} ${r.region_2depth_name}`;
          setEditForm((prev) => ({ ...prev, address: addr }));
        }
      });
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.put('/api/users/me', editForm);
    setUser(res.data);
    setEditOpen(false);
  };

  if (!user) return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <div className="text-6xl mb-4">🐾</div>
        <p className="text-gray-500">로딩 중...</p>
      </div>
    </div>
  );

  const initial = (user.nickname ?? user.name ?? '?')[0].toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* 프로필 카드 */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-3xl font-bold text-white shadow-md flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-800">{user.nickname ?? user.name}</h2>
            <p className="text-gray-500 text-sm mt-0.5">{user.email}</p>
          </div>
          <Button
            onClick={() => setEditOpen(true)}
            variant="outline"
            className="border-purple-300 text-purple-600 hover:bg-purple-50 rounded-full shrink-0"
          >
            <Pencil className="w-4 h-4 mr-2" />
            프로필 수정
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <MapPin className="w-5 h-5 text-purple-500 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 mb-0.5">주소</p>
              <p className="text-sm font-medium text-gray-700">{user.address || '미설정'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <Mail className="w-5 h-5 text-purple-500 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 mb-0.5">이메일</p>
              <p className="text-sm font-medium text-gray-700 truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <Calendar className="w-5 h-5 text-purple-500 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 mb-0.5">가입일</p>
              <p className="text-sm font-medium text-gray-700">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 활동 통계 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {myPosts.length}
          </p>
          <p className="text-sm text-gray-500 mt-1">작성한 글</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {myWalks.length}
          </p>
          <p className="text-sm text-gray-500 mt-1">산책 매칭</p>
        </div>
      </div>

      {/* 최근 활동 탭 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 flex-1 justify-center py-4 text-sm font-medium transition-colors ${
                activeTab === key
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="divide-y divide-gray-50">
          {activeTab === 'posts' && (
            myPosts.length === 0
              ? <EmptyState text="아직 작성한 글이 없어요" />
              : myPosts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => navigate(`/posts/${post.id}`)}
                  className="w-full text-left px-6 py-4 hover:bg-purple-50 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{post.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                      {post.category && ` · ${post.category}`}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                </button>
              ))
          )}

          {activeTab === 'walks' && (
            myWalks.length === 0
              ? <EmptyState text="아직 등록한 산책 매칭이 없어요" />
              : myWalks.map((walk) => (
                <div key={walk.id} className="px-6 py-4">
                  <p className="font-medium text-gray-800">{walk.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {walk.walkDate} · {walk.startTime}~{walk.endTime}
                    {walk.location && ` · ${walk.location}`}
                  </p>
                  {walk.reward && (
                    <span className="inline-block mt-1.5 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                      {walk.reward}
                    </span>
                  )}
                </div>
              ))
          )}
        </div>
      </div>

      {/* 프로필 수정 모달 */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>프로필 수정</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>닉네임</Label>
              <Input
                value={editForm.nickname}
                onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                placeholder="닉네임"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>주소</Label>
              <div className="flex gap-2">
                <Input
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="예: 서울시 강남구"
                  className="h-11 flex-1"
                />
                <Button
                  type="button"
                  onClick={handleGpsAddress}
                  variant="outline"
                  className="border-purple-300 text-purple-600 hover:bg-purple-50 shrink-0"
                  title="현재 위치로 자동 입력"
                >
                  <MapPin className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-400">📍 버튼으로 현재 위치 자동 입력</p>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              저장
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-3">🐾</div>
      <p className="text-gray-500 text-sm">{text}</p>
    </div>
  );
}
