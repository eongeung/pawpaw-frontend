if (typeof window !== 'undefined') {
  window.global = window;
}

import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  return <RouterProvider router={router} />;
}