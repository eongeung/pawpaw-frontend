import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

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

    if (!post) return <div>로딩중...</div>;

    return (
        <div style={{ maxWidth: '700px', width: '100%', padding: '0 16px', boxSizing: 'border-box' }}>
            <button onClick={() => navigate('/')}>← 목록으로</button>
            <div style={{ marginTop: '16px' }}>
                <span style={{ fontSize: '13px', color: '#888' }}>{post.category}</span>
                <h2 style={{ margin: '4px 0' }}>{post.title}</h2>
                <p style={{ fontSize: '13px', color: '#888' }}>
                    {post.nickname} | {new Date(post.createdAt).toLocaleDateString()}
                </p>
            </div>
            <hr />
            <p style={{ lineHeight: '1.6' }}>{post.content}</p>
            <button onClick={handleLike}>{liked ? '❤️' : '🤍'} {likeCount}</button>
            <hr />
            <h4>댓글 {comments.length}개</h4>
            {comments.length === 0 && <p style={{ color: '#888', fontSize: '14px' }}>아직 댓글이 없어요</p>}
            {comments.map((c) => (
                <div key={c.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{c.nickname}</span>
                    <span style={{ fontSize: '14px', marginLeft: '8px' }}>{c.content}</span>
                </div>
            ))}
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="댓글 입력"
                    style={{ flex: 1 }}
                />
                <button onClick={handleComment}>등록</button>
            </div>
        </div>
    );
}