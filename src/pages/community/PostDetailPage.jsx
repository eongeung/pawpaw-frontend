import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import axios from '../../api/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ArrowLeft, Heart, MessageCircle } from 'lucide-react';

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    axios.get(`/api/posts/${postId}`).then((res) => {
      setPost(res.data);
      setLikeCount(res.data.likeCount);
    });
    axios.get(`/api/posts/${postId}/comments`).then((res) => setComments(res.data));
  }, [postId]);

  const handleLike = async () => {
    const res = await axios.post(`/api/posts/${postId}/likes`);
    if (res.data === '좋아요') {
      setLikeCount((prev) => prev + 1);
      setLiked(true);
    } else {
      setLikeCount((prev) => prev - 1);
      setLiked(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    const res = await axios.post(`/api/posts/${postId}/comments`, { content });
    setComments([...comments, res.data]);
    setContent('');
  };

  if (!post) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-6xl mb-4">🐾</div>
        <p className="text-gray-600">로딩중...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <Button
        onClick={() => navigate('/')}
        variant="ghost"
        className="mb-6 hover:bg-purple-50"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        목록으로
      </Button>

      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="mb-6">
          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm mb-3">
            {post.category}
          </span>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{post.title}</h1>
          <p className="text-sm text-gray-500">
            {post.nickname} · {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="border-t border-gray-100 pt-6 mb-6">
          <p className="text-gray-700 text-lg whitespace-pre-wrap">{post.content}</p>
        </div>

        <div className="border-t border-gray-100 pt-6 mb-6">
          <Button
            onClick={handleLike}
            variant="outline"
            className={`rounded-full ${liked ? 'bg-purple-50 border-purple-300 text-purple-600' : 'border-gray-300'}`}
          >
            <Heart className={`w-5 h-5 mr-2 ${liked ? 'fill-purple-600' : ''}`} />
            {likeCount}
          </Button>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-800">댓글 {comments.length}개</h3>
          </div>

          {comments.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              아직 댓글이 없어요. 첫 댓글을 남겨보세요!
            </p>
          )}

          <div className="space-y-4 mb-6">
            {comments.map((c) => (
              <div key={c.id} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-800">{c.nickname}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700">{c.content}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleComment} className="flex gap-3">
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="댓글을 입력하세요"
              className="flex-1 h-12 rounded-full"
              required
            />
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 shadow-md hover:shadow-lg transition-all rounded-full"
            >
              등록
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
