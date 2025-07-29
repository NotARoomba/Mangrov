import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../hooks/useAuth";
import PageWrapper from "../components/PageWrapper";
import { ArrowLeft, Heart, Package, User } from "lucide-react";
import type { Post, User as UserType } from "../utils/types";

export default function UserProfile() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserType | null>(null);
  const [userTrades, setUserTrades] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"trades" | "interests">("trades");

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserType;
          setUserData(data);
        } else {
          navigate("/error");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/error");
      }
    };

    const fetchUserTrades = async () => {
      try {
        const tradesQuery = query(
          collection(db, "trades"),
          where("uid", "==", userId)
        );
        const tradesSnap = await getDocs(tradesQuery);
        const trades = tradesSnap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as Post))
          .filter((trade) => trade.isAvailable !== false); // Only show available trades
        setUserTrades(trades);
      } catch (error) {
        console.error("Error fetching user trades:", error);
      }
    };

    Promise.all([fetchUserData(), fetchUserTrades()]).finally(() => {
      setLoading(false);
    });
  }, [userId, navigate]);

  if (loading) {
    return (
      <PageWrapper className="min-h-screen bg-neutral-950">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">Loading profile...</div>
        </div>
      </PageWrapper>
    );
  }

  if (!userData) {
    return (
      <PageWrapper className="min-h-screen bg-neutral-950">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">User not found</div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="min-h-screen bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-neutral-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-neutral-800"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white">User Profile</h1>
        </div>

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900 rounded-xl p-6 border border-neutral-700 mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {userData.displayName?.charAt(0) ||
                  userData.username?.charAt(0) ||
                  "U"}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {userData.displayName}
              </h2>
              <p className="text-neutral-400">@{userData.username}</p>
              {userData.bio && (
                <p className="text-neutral-300 mt-2">{userData.bio}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-700 mb-6">
          <button
            onClick={() => setActiveTab("trades")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition cursor-pointer ${
              activeTab === "trades"
                ? "text-primary border-b-2 border-primary"
                : "text-neutral-400 hover:text-neutral-300"
            }`}
          >
            <Package size={16} />
            Trades ({userTrades.length})
          </button>
          <button
            onClick={() => setActiveTab("interests")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition cursor-pointer ${
              activeTab === "interests"
                ? "text-primary border-b-2 border-primary"
                : "text-neutral-400 hover:text-neutral-300"
            }`}
          >
            <Heart size={16} />
            Interests
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "trades" ? (
            <motion.div
              key="trades"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {userTrades.length === 0 ? (
                <div className="text-center text-neutral-400 py-16">
                  <Package className="w-16 h-16 mx-auto mb-6 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">
                    No trades available
                  </h3>
                  <p className="text-neutral-500">
                    This user hasn't added any trades yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userTrades.map((trade, idx) => (
                    <motion.div
                      key={trade.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-neutral-900 rounded-xl border border-neutral-700 overflow-hidden hover:border-primary transition-colors cursor-pointer"
                      onClick={() => navigate(`/trades/${trade.id}`)}
                    >
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={trade.images?.[0]}
                          alt={trade.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-white font-semibold mb-2 line-clamp-2">
                          {trade.title}
                        </h3>
                        <p className="text-neutral-400 text-sm line-clamp-2">
                          {trade.description}
                        </p>
                        {trade.niche && trade.niche.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {trade.niche.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {trade.niche.length > 2 && (
                              <span className="text-xs text-neutral-500">
                                +{trade.niche.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="interests"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {!userData.interests || userData.interests.length === 0 ? (
                <div className="text-center text-neutral-400 py-16">
                  <Heart className="w-16 h-16 mx-auto mb-6 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">
                    No interests listed
                  </h3>
                  <p className="text-neutral-500">
                    This user hasn't added any interests yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {userData.interests.map((interest, idx) => (
                    <motion.div
                      key={interest}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-neutral-900 rounded-xl p-4 border border-neutral-700 text-center hover:border-primary transition-colors"
                    >
                      <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-white font-medium">{interest}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
