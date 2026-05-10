import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import PostListPage from "./pages/community/PostListPage";
import PostDetailPage from "./pages/community/PostDetailPage";
import PostCreatePage from "./pages/community/PostCreatePage";
import PetPage from "./pages/pet/PetPage";
import WalkRequestPage from "./pages/walk/WalkRequestPage";
import HospitalPage from "./pages/hospital/HospitalPage";
import ChatPage from "./pages/chat/ChatPage";
import MyPage from "./pages/mypage/MyPage";
import KakaoCallback from "./pages/auth/KakaoCallback";
import useAuthStore from "./store/authStore";

function PrivateRoute({ children }) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  return isLoggedIn ? children : <Navigate to="/login" />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignUpPage />,
  },
  {
    path: "/oauth/kakao",
    element: <KakaoCallback />,
  },
  {
    path: "/",
    element: <PrivateRoute><Layout /></PrivateRoute>,
    children: [
      { index: true, element: <PostListPage /> },
      { path: "posts/:postId", element: <PostDetailPage /> },
      { path: "posts/new", element: <PostCreatePage /> },
      { path: "pets", element: <PetPage /> },
      { path: "walk", element: <WalkRequestPage /> },
      { path: "hospital", element: <HospitalPage /> },
      { path: "chat", element: <ChatPage /> },
      { path: "mypage", element: <MyPage /> },
    ],
  },
]);