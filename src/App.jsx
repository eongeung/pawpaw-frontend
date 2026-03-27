import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import useAuthStore from './store/authStore';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import PostListPage from './pages/community/PostListPage';
import PostDetailPage from './pages/community/PostDetailPage';
import PostCreatePage from './pages/community/PostCreatePage';
import WalkRequestPage from './pages/walk/WalkRequestPage';
import HospitalPage from './pages/hospital/HospitalPage';
import ChatPage from './pages/chat/ChatPage';
import PetPage from './pages/pet/PetPage';

function PrivateRoute({ children }) {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    return isLoggedIn ? children : <Navigate to="/login" />;
}

function NavBar() {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const setLoggedIn = useAuthStore((state) => state.setLoggedIn);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setLoggedIn(false);
        window.location.href = '/login';
    };

    return (
        <nav style={{ padding: '10px', borderBottom: '1px solid #ccc', display: 'flex', gap: '16px' }}>
            <Link to="/">커뮤니티</Link>
            <Link to="/pets">내 펫</Link>
            <Link to="/walk">산책 매칭</Link>
            <Link to="/hospital">동물병원</Link>
            <Link to="/chat">채팅</Link>
            {isLoggedIn
                ? <button onClick={handleLogout}>로그아웃</button>
                : <Link to="/login">로그인</Link>
            }
        </nav>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <NavBar />
            <div style={{ padding: '16px' }}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/" element={<PrivateRoute><PostListPage /></PrivateRoute>} />
                    <Route path="/posts/:postId" element={<PrivateRoute><PostDetailPage /></PrivateRoute>} />
                    <Route path="/walk" element={<PrivateRoute><WalkRequestPage /></PrivateRoute>} />
                    <Route path="/hospital" element={<PrivateRoute><HospitalPage /></PrivateRoute>} />
                    <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
                    <Route path="/pets" element={<PrivateRoute><PetPage /></PrivateRoute>} />
                    <Route path="/posts/new" element={<PrivateRoute><PostCreatePage /></PrivateRoute>} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}