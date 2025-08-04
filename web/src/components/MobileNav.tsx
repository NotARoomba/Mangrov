import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Home,
  Search,
  Plus,
  MessageSquare,
  ShoppingBag,
  User,
  ArrowLeftRight,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../hooks/useCart";
import { useUnreadMessages } from "../hooks/useUnreadMessages";
import { useAuth } from "../hooks/useAuth";
import ConfirmDialog from "./ConfirmDialog";

const SIZE = 24;

const links = [
  { to: "/dashboard", icon: <Home size={SIZE} />, label: "Home" },
  { to: "/search", icon: <Search size={SIZE} />, label: "Search" },
  { to: "/add", icon: <Plus size={SIZE} />, label: "Add" },
  { to: "/trade", icon: <ArrowLeftRight size={SIZE} />, label: "Activity" },
  { to: "/messages", icon: <MessageSquare size={SIZE} />, label: "Messages" },
  { to: "/cart", icon: <ShoppingBag size={SIZE} />, label: "Cart" },
  { to: "/user", icon: <User size={SIZE} />, label: "Profile" },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { totalUnread } = useUnreadMessages();
  const { user, signOut } = useAuth();
  const [userUsername, setUserUsername] = useState<string | null>(null);

  // Fetch user's username
  useEffect(() => {
    const fetchUserUsername = async () => {
      if (user) {
        try {
          const { fetchUserData } = await import("../utils/firebaseHelpers");
          const userData = await fetchUserData(user.uid);
          if (userData?.username) {
            setUserUsername(userData.username);
          }
        } catch (error) {
          console.error("Error fetching user username:", error);
        }
      }
    };

    fetchUserUsername();
  }, [user]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = (to: string) => {
    setIsOpen(false);

    // Handle profile link with username
    if (to === "/user") {
      if (userUsername) {
        navigate(`/user/${userUsername}`, { replace: true });
      } else {
        navigate("/user", { replace: true });
      }
    } else {
      navigate(to, { replace: true });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      x: "100%",
      transition: {
        duration: 0.3,
        ease: "easeInOut" as const,
      },
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut" as const,
      },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, x: 20 },
    open: { opacity: 1, x: 0 },
  };

  return (
    <>
      {/* Hamburger Button */}
      <motion.button
        onClick={toggleMenu}
        className="fixed top-4 right-4 z-50 p-3 bg-neutral-900/80 backdrop-blur-sm rounded-xl border border-white/10 text-white hover:bg-neutral-800/80 transition-all duration-200"
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-neutral-900 border-l border-white/10 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <img src="/icon.png" alt="logo" className="w-10 h-10" />
                <div>
                  <h1 className="text-xl font-bold text-white">Mangrov</h1>
                  <p className="text-sm text-white/60">Discover & Connect</p>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                {links.map((link, index) => {
                  const isActive = location.pathname === link.to;
                  const isCart = link.to === "/cart";
                  const isMessages = link.to === "/messages";
                  const isInChat = location.pathname.startsWith("/messages/");
                  const isProfile = link.to === "/user";
                  const isInProfile = location.pathname.startsWith("/user/");

                  return (
                    <motion.div
                      key={link.to}
                      variants={itemVariants}
                      transition={{ delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => handleLinkClick(link.to)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                          isActive ||
                          (isMessages && isInChat) ||
                          (isProfile && isInProfile)
                            ? "bg-primary text-white"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <div className="relative">
                          {link.icon}
                          {isCart && totalItems > 0 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full"
                            >
                              {totalItems}
                            </motion.div>
                          )}
                          {isMessages && totalUnread > 0 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full"
                            >
                              {totalUnread > 99 ? "99+" : totalUnread}
                            </motion.div>
                          )}
                        </div>
                        <span className="font-medium">{link.label}</span>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </nav>

            {/* Logout Section */}
            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center gap-4 p-4 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
              >
                <LogOut size={SIZE} />
                <span className="font-medium">Logout</span>
              </button>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
              <div className="text-center">
                <p className="text-xs text-white/40">© 2025 Mangrov</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to logout? You'll need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        type="warning"
      />
    </>
  );
}
