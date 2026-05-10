if (typeof window !== 'undefined') {
  window.global = window;
}

import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./components/ui/dialog";
import { Button } from "./components/ui/button";
import { LogIn, WifiOff } from "lucide-react";
import useAuthStore from "./store/authStore";
import useErrorStore from "./store/errorStore";

function SessionExpiredModal() {
  const sessionExpired = useErrorStore((s) => s.sessionExpired);
  const setSessionExpired = useErrorStore((s) => s.setSessionExpired);
  const setLoggedIn = useAuthStore((s) => s.setLoggedIn);

  const handleReLogin = () => {
    setLoggedIn(false);
    setSessionExpired(false);
    router.navigate('/login');
  };

  return (
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
  );
}

function NetworkErrorModal() {
  const networkError = useErrorStore((s) => s.networkError);
  const setNetworkError = useErrorStore((s) => s.setNetworkError);
  const setLoggedIn = useAuthStore((s) => s.setLoggedIn);

  const handleClose = () => setNetworkError(false);

  const handleReLogin = () => {
    setLoggedIn(false);
    setNetworkError(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.navigate('/login');
  };

  return (
    <Dialog open={networkError} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            서버에 연결할 수 없습니다
          </DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <WifiOff className="w-14 h-14 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-sm mb-6">
            서버 연결이 끊겼습니다.
            <br />
            잠시 후 다시 시도하거나 다시 로그인해주세요.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1 border-gray-300 text-gray-600">
              닫기
            </Button>
            <Button
              onClick={handleReLogin}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
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
