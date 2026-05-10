import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axios from '../../api/axios';
import useAuthStore from '../../store/authStore';

export default function KakaoCallback() {
  const navigate = useNavigate();
  const setLoggedIn = useAuthStore((state) => state.setLoggedIn);
  const setUserId = useAuthStore((state) => state.setUserId);
  const setUserInfo = useAuthStore((state) => state.setUserInfo);
  const [error, setError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    // 카카오에 넘긴 redirectUri와 정확히 동일한 값이어야 토큰 교환이 성공합니다
    const redirectUri = `${window.location.origin}/oauth/kakao`;

    if (!code) {
      navigate('/login');
      return;
    }

    axios.post('/api/auth/kakao', { code, redirectUri })
      .then((res) => {
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        setLoggedIn(true);
        setUserId(res.data.userId);
        if (res.data.email || res.data.nickname) {
          setUserInfo({ email: res.data.email, nickname: res.data.nickname });
        }
        navigate('/');
      })
      .catch(() => {
        setError(true);
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-50/50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-sm w-full">
          <div className="text-5xl mb-4">😢</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">카카오 로그인 실패</h2>
          <p className="text-gray-500 text-sm mb-6">인증 중 오류가 발생했습니다. 다시 시도해주세요.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-50/50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🐾</div>
        <p className="text-gray-500">카카오 로그인 처리 중...</p>
      </div>
    </div>
  );
}
