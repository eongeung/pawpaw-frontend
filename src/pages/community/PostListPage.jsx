import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from '../../api/axios';
import { Button } from '../../components/ui/button';
import { Plus, Heart, MessageCircle } from 'lucide-react';

export default function PostListPage() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/posts').then((res) => setPosts(res.data));
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">커뮤니티</h1>
        <Button 
          onClick={() => navigate('/posts/new')}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          글쓰기
        </Button>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            onClick={() => navigate(`/posts/${post.id}`)}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-6 cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-800">{post.title}</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-purple-600">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm font-semibold">{post.likeCount}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{post.commentCount ?? 0}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full mr-2">
                {post.category}
              </span>
              {post.nickname} · {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐾</div>
            <p className="text-gray-600">아직 게시글이 없어요. 첫 게시글을 작성해보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}
