import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from '../../api/axios';
import useAuthStore from '../../store/authStore';
import { User, FileText, Heart, MessageCircle } from 'lucide-react';

export default function MyPage() {
  const [myPosts, setMyPosts] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const userId = useAuthStore((state) => state.userId);

  useEffect(() => {
    axios.get('/api/users/me').then((res) => setUserInfo(res.data)).catch(() => {});
    axios.get('/api/posts/my').then((res) => setMyPosts(res.data)).catch(() => {});
  }, []);

  const totalLikes = myPosts.reduce((sum, p) => sum + (p.likeCount ?? 0), 0);
  const totalComments = myPosts.reduce((sum, p) => sum + (p.commentCount ?? 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">마이페이지</h1>

      {/* 사용자 정보 */}
      <div className="bg-white rounded-2xl shadow-sm p-8 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-white text-3xl shadow-md">
          <User className="w-10 h-10" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-800">
            {userInfo?.nickname ?? '사용자'}
          </p>
          {userInfo?.email && (
            <p className="text-sm text-gray-500 mt-1">{userInfo.email}</p>
          )}
        </div>
      </div>

      {/* 활동 내역 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <FileText className="w-7 h-7 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{myPosts.length}</p>
          <p className="text-sm text-gray-500 mt-1">작성한 글</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <Heart className="w-7 h-7 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{totalLikes}</p>
          <p className="text-sm text-gray-500 mt-1">받은 좋아요</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <MessageCircle className="w-7 h-7 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{totalComments}</p>
          <p className="text-sm text-gray-500 mt-1">받은 댓글</p>
        </div>
      </div>

      {/* 내가 쓴 글 */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">내가 쓴 글</h2>
        {myPosts.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-3">🐾</div>
            <p className="text-gray-500">아직 작성한 글이 없어요.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => navigate(`/posts/${post.id}`)}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                    {post.category}
                  </span>
                  <p className="text-gray-800 font-medium truncate">{post.title}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="flex items-center gap-1 text-sm text-purple-600">
                    <Heart className="w-3.5 h-3.5" />
                    {post.likeCount ?? 0}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-400">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {post.commentCount ?? 0}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
