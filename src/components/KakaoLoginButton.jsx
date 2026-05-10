const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;

export default function KakaoLoginButton({ label = '카카오로 계속하기' }) {
  const handleKakaoLogin = () => {
    const redirectUri = `${window.location.origin}/oauth/kakao`;
    window.location.href =
      `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
  };

  return (
    <button
      type="button"
      onClick={handleKakaoLogin}
      className="w-full flex items-center justify-center gap-3 py-3 bg-[#FEE500] hover:bg-[#F5DC00] text-[#191919] font-medium rounded-xl transition-colors"
    >
      <KakaoIcon />
      {label}
    </button>
  );
}

function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3C7.029 3 3 6.36 3 10.5c0 2.625 1.696 4.928 4.271 6.244L6.2 20.1a.375.375 0 0 0 .545.415L11.1 18.04c.296.022.595.034.9.034 4.971 0 9-3.36 9-7.5S16.971 3 12 3z"
        fill="#191919"
      />
    </svg>
  );
}
