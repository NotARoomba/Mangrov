import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useSearchParams } from "react-router";
import PageWrapper from "../components/PageWrapper";
import EditProfileModal from "../components/EditProfileModal";
import TradeDetailModal from "../components/TradeDetailModal";
import PostDetailModal from "../components/PostDetailModal";
import { Bookmark, Grid3x3, User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getFlagEmoji, getEarthToneColor } from "../utils/helpers";
import {
  fetchUserData,
  fetchUserTrades,
  fetchSavedPosts,
} from "../utils/firebaseHelpers";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Profile() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [userData, setUserData] = useState<any>(null);
  const [userTrades, setUserTrades] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"trades" | "saved">("trades");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadProfileData = async () => {
      try {
        const [userDataResult, tradesResult, savedPostsResult] =
          await Promise.all([
            fetchUserData(user.uid),
            fetchUserTrades(user.uid),
            fetchSavedPosts(user.uid),
          ]);

        setUserData(userDataResult);
        setUserTrades(tradesResult);
        setSavedPosts(savedPostsResult);
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

  // Handle tab from URL parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "saved") {
      setActiveTab("saved");
    } else {
      setActiveTab("trades");
    }
  }, [searchParams]);

  const handleTradeClick = (trade: any) => {
    setSelectedTrade(trade);
    setShowTradeModal(true);
  };

  const handlePostClick = (post: any) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  // Handler to update a trade in userTrades after editing
  const handleTradeUpdate = (updatedTrade: any) => {
    setUserTrades((prev) =>
      prev.map((trade) =>
        trade.id === updatedTrade.id ? { ...trade, ...updatedTrade } : trade
      )
    );
    setSelectedTrade(updatedTrade);
  };

  if (loading) {
    return (
      <PageWrapper className="px-4 py-8 text-white max-w-4xl mx-auto">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-full bg-neutral-700 animate-pulse"></div>
            <div>
              <div className="w-48 h-8 bg-neutral-700 rounded mb-2 animate-pulse"></div>
              <div className="w-32 h-4 bg-neutral-700 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="w-24 h-10 bg-neutral-700 rounded animate-pulse"></div>
        </div>

        {/* Interests Skeleton */}
        <div className="mt-6 mb-8">
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-24 h-8 bg-neutral-700 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex justify-center border-t border-white/10 mb-4">
          {[1, 2].map((i) => (
            <div key={i} className="w-1/2 py-3">
              <div className="w-16 h-4 bg-neutral-700 rounded mx-auto animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-square bg-neutral-700 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="px-4 py-8 text-white max-w-4xl mx-auto">
      {user && userData && (
        <>
          {/* Header */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-5">
              {userData.avatar ? (
                <img
                  src={userData.avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border border-white/10"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border border-white/10 bg-white/10 flex items-center justify-center">
                  <User size={40} className="text-white/60" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {userData.name}
                  <span>
                    {" "}
                    - {"    "}
                    {getFlagEmoji(userData.country || "")}
                  </span>
                </h1>
                <p className="text-sm text-white/60">{user.email}</p>
              </div>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="px-6 rounded-md py-1.5 text-sm bg-primary text-primary-foreground hover:bg-primary/80 cursor-pointer transition-all duration-200 active:scale-95 uppercase tracking-wide font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              EDIT PROFILE
            </button>
          </motion.div>

          {/* Interests */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-6 mb-8"
          >
            <div className="flex flex-wrap gap-3">
              {(userData.interests || []).map((interest: string) => (
                <span
                  key={interest}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold text-white ${getEarthToneColor(
                    interest
                  )}`}
                >
                  {interest
                    .replace("_", " ")
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex justify-center border-t border-white/10 mb-4"
          >
            <button
              onClick={() => setActiveTab("trades")}
              className={`flex items-center justify-center gap-1 px-6 py-3 text-sm font-medium transition w-1/2 cursor-pointer ${
                activeTab === "trades"
                  ? "border-t-2 border-white"
                  : "text-white/40"
              }`}
            >
              <Grid3x3 size={18} />
              Trades
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center justify-center gap-1 px-6 py-3 text-sm font-medium transition w-1/2 cursor-pointer ${
                activeTab === "saved"
                  ? "border-t-2 border-white"
                  : "text-white/40"
              }`}
            >
              <Bookmark size={18} />
              Saved
            </button>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {(activeTab === "trades" ? userTrades : savedPosts).map(
              (item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`relative aspect-square overflow-hidden rounded-xl bg-white/10 cursor-pointer hover:scale-105 transition-transform duration-200 ${
                    activeTab === "trades"
                      ? "hover:border-2 hover:border-primary"
                      : ""
                  }`}
                  onClick={() =>
                    activeTab === "trades"
                      ? handleTradeClick(item)
                      : handlePostClick(item)
                  }
                >
                  <img
                    src={item.images?.[0]}
                    alt={item.title || item.caption || "Item"}
                    className="object-cover w-full h-full"
                  />
                  {activeTab === "trades" && !item.isAvailable && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                      UNAVAILABLE
                    </div>
                  )}
                </motion.div>
              )
            )}

            {activeTab === "trades" && userTrades.length === 0 && (
              <p className="text-sm text-white/40 col-span-full text-center">
                You haven't added any trades yet.
              </p>
            )}
            {activeTab === "saved" && savedPosts.length === 0 && (
              <p className="text-sm text-white/40 col-span-full text-center">
                No saved posts yet.
              </p>
            )}
          </motion.div>
        </>
      )}
      <AnimatePresence mode="wait">
        {showModal && (
          <EditProfileModal
            initialData={userData}
            setData={(data) => setUserData(data)}
            onClose={() => setShowModal(false)}
          />
        )}
        {showTradeModal && (
          <TradeDetailModal
            trade={selectedTrade}
            isOpen={showTradeModal}
            onClose={() => {
              setShowTradeModal(false);
              setSelectedTrade(null);
            }}
            onTradeUpdate={handleTradeUpdate}
          />
        )}
        {showPostModal && selectedPost && (
          <PostDetailModal
            post={selectedPost}
            onClose={() => {
              setShowPostModal(false);
              setSelectedPost(null);
            }}
            user={user}
            liked={false}
            saved={true}
            handleLike={() => {}}
            handleSave={() => {}}
          />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
