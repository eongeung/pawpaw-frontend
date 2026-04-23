if (typeof window !== 'undefined') {
  window.global = window;
}

import { useState, useEffect } from "react";
import { RouterProvider, useNavigate } from "react-router";
import { router } from "./routes";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./components/ui/dialog";
import { Button } from "./components/ui/button";
import { LogIn, WifiOff } from "lucide-react";
import useAuthStore from "./store/authStore";

function SessionExpiredModal() {
  const [open, setOpen] = useState(false);
  const setLoggedIn = useAuthStore((state) => state.setLoggedIn);

  useEffect(() => {
    const handleSessionExpired = () => setOpen(true);
    window.addEventListener('session-expired', handleSessionExpired);
    return () => window.removeEventListener('session-expired', handleSessionExpired);
  }, []);

  const handleReLogin = () => {
    setLoggedIn(false);
    setOpen(false);
    router.navigate('/login');
  };

  return (
    <Dialog open={open}>
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
  );
}

function NetworkErrorModal() {
  const [open, setOpen] = useState(false);
  const setLoggedIn = useAuthStore((state) => state.setLoggedIn);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('network-error', handler);
    return () => window.removeEventListener('network-error', handler);
  }, []);

  const handleReLogin = () => {
    setLoggedIn(false);
    setOpen(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.navigate('/login');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            서버에 연결할 수 없습니다
          </DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <div className="text-5xl mb-4">
            <WifiOff className="w-14 h-14 mx-auto text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm mb-6">
            서버 연결이 끊겼습니다.
            <br />
            잠시 후 다시 시도하거나 다시 로그인해주세요.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-gray-300 text-gray-600"
            >
              닫기
            </Button>
            <Button
              onClick={handleReLogin}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md"
            >
              <LogIn className="w-4 h-4 mr-2" />
              다시 로그인
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <SessionExpiredModal />
      <NetworkErrorModal />
    </>
  );
}
