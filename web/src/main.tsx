import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./hooks/useAuth";
import { createBrowserRouter, RouterProvider } from "react-router";
import Root from "./pages/Root";
import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import Add from "./pages/Add";
import Trade from "./pages/Trade";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import { CartProvider } from "./hooks/useCart";
import { AuthProvider } from "./hooks/useAuth";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      {
        index: true,
        Component: Home,
      },
      { path: "about", Component: About },
      // {
      //   path: "dashboard",
      //   children: [
      //     { index: true, Component: ConcertsHome },
      //     { path: ":city", Component: ConcertsCity },
      //     { path: "trending", Component: ConcertsTrending },
      //   ],
      // },
      {
        path: "dashboard",
        Component: Dashboard,
      },
      {
        path: "search",
        Component: Search,
      },
      {
        path: "add",
        Component: Add,
      },
      {
        path: "trade",
        Component: Trade,
      },
      {
        path: "messages",
        Component: Messages,
      },
      {
        path: "cart",
        Component: Cart,
      },
      {
        path: "profile",
        Component: Profile,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);
