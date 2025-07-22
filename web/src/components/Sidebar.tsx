import { useLocation, Link } from "react-router";
import {
  Home,
  Search,
  Plus,
  MessageSquare,
  ShoppingBag,
  User,
  ArrowLeftRight,
} from "lucide-react";

const SIZE = 25;

const links = [
  { to: "/dashboard", icon: <Home size={SIZE} />, label: "Home" },
  { to: "/search", icon: <Search size={SIZE} />, label: "Search" },
  { to: "/add", icon: <Plus size={SIZE} />, label: "Add" },
  { to: "/trade", icon: <ArrowLeftRight size={SIZE} />, label: "Activity" },
  { to: "/messages", icon: <MessageSquare size={SIZE} />, label: "Messages" },
  { to: "/cart", icon: <ShoppingBag size={SIZE} />, label: "Cart" },
  { to: "/profile", icon: <User size={SIZE} />, label: "Profile" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-14 md:w-20 bg-primary-950 border-r border-white/10 flex flex-col items-center py-4 gap-4 fixed left-0 top-0 bottom-0 z-10">
      <Link to="/">
        <img
          src="/icon.png"
          alt="logo"
          className="w-8 h-8 md:w-10 md:h-10 mb-4"
        />
      </Link>
      {links.map((link) => {
        const isActive = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            className={`p-2 rounded-lg transition-all ${
              isActive
                ? "bg-primary text-white"
                : "text-white/60 hover:text-white"
            } ${link.to === "/cart" ? "mt-auto" : ""}`}
          >
            {link.icon}
          </Link>
        );
      })}
    </aside>
  );
}
