import { useLocation, Link, useNavigate } from "react-router";
import {
  Home,
  Search,
  Plus,
  MessageSquare,
  ShoppingBag,
  User,
  ArrowLeftRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../hooks/useCart";
import { useUnreadMessages } from "../hooks/useUnreadMessages";
import { useEffect } from "react";

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
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { totalUnread } = useUnreadMessages();

  useEffect(() => {
    console.log("totalItems changed:", totalItems);
    console.log("totalUnread changed:", totalUnread);
  }, [totalItems, totalUnread]);
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
        const isCart = link.to === "/cart";
        const isMessages = link.to === "/messages";
        const isInChat = location.pathname.startsWith("/messages/");

        // Handle messages icon click separately to ensure proper navigation
        const handleMessagesClick = (e: React.MouseEvent) => {
          e.preventDefault();
          // Force navigation to messages list and clear any selected chat
          navigate("/messages", { replace: true });
        };

        if (isMessages) {
          return (
            <button
              key={link.to}
              onClick={handleMessagesClick}
              className={`relative p-2 cursor-pointer rounded-lg transition-all duration-200 ${
                isActive || isInChat
                  ? "bg-primary text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {link.icon}

              {totalUnread > 0 && (
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={totalUnread}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full"
                  >
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </motion.div>
                </AnimatePresence>
              )}
            </button>
          );
        }

        return (
          <Link
            key={link.to}
            to={link.to}
            className={`relative p-2 rounded-lg transition-all duration-200 ${
              isActive
                ? "bg-primary text-white"
                : "text-white/60 hover:text-white"
            } ${isCart ? "mt-auto" : ""}`}
          >
            {link.icon}

            {isCart && totalItems > 0 && (
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={totalItems}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full"
                >
                  {totalItems}
                </motion.div>
              </AnimatePresence>
            )}
          </Link>
        );
      })}
    </aside>
  );
}
