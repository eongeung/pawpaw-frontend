import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Home, PawPrint, Footprints, Hospital, MessageCircle, LogIn } from "lucide-react";
import useAuthStore from "../store/authStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const setLoggedIn = useAuthStore((state) => state.setLoggedIn);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const handleSessionExpired = () => setSessionExpired(true);
    window.addEventListener('session-expired', handleSessionExpired);
    return () => window.removeEventListener('session-expired', handleSessionExpired);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setLoggedIn(false);
    navigate('/login');
  };

  const handleReLogin = () => {
    setLoggedIn(false);
    setSessionExpired(false);
    navigate('/login');
  };

  const navItems = [
    { icon: Home, label: "커뮤니티", path: "/" },
    { icon: PawPrint, label: "내 펫", path: "/pets" },
    { icon: Footprints, label: "산책 매칭", path: "/walk" },
    { icon: Hospital, label: "동물병원", path: "/hospital" },
    { icon: MessageCircle, label: "채팅", path: "/chat" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-50/50 to-indigo-50">

      {/* 세션 만료 모달 */}
      <Dialog open={sessionExpired}>
        <DialogContent
          className="max-w-sm text-center"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              로그인이 만료되었습니다
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <div className="text-5xl mb-4">🔒</div>
            <p className="text-gray-500 text-sm mb-6">
              보안을 위해 세션이 만료되었습니다.
              <br />
              다시 로그인해주세요.
            </p>
            <Button
              onClick={handleReLogin}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              <LogIn className="w-4 h-4 mr-2" />
              다시 로그인
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="text-3xl">🐾</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              PawPaw
            </h1>
          </Link>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg transition-all"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all whitespace-nowrap ${
                    isActive
                      ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                      : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
