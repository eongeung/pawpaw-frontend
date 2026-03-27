import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

export default function PostListPage() {
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/posts').then((res) => setPosts(res.data));
    }, []);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>커뮤니티</h2>
                <button onClick={() => navigate('/posts/new')}>글쓰기</button>
            </div>
            {posts.map((post) => (
                <div
                    key={post.id}
                    onClick={() => navigate(`/posts/${post.id}`)}
                    style={{ padding: '12px', borderBottom: '1px solid #ccc', cursor: 'pointer' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h4 style={{ margin: 0 }}>{post.title}</h4>
                        <span>❤️ {post.likeCount}</span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>
                        {post.category} | {post.nickname} | {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                </div>
            ))}
        </div>
    );
}