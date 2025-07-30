import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import PageWrapper from "../components/PageWrapper";
import { ArrowLeft, Package, User } from "lucide-react";
import type { Post, User as UserType } from "../utils/types";
import {
  getEarthToneColor,
  getInterestLabel,
  getFlagEmoji,
} from "../utils/helpers";
import { fetchUserData, fetchUserTrades } from "../utils/firebaseHelpers";

export default function UserProfile() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserType | null>(null);
  const [userTrades, setUserTrades] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const loadUserData = async () => {
      try {
        const [userDataResult, tradesResult] = await Promise.all([
          fetchUserData(userId),
          fetchUserTrades(userId),
        ]);

        if (userDataResult) {
          setUserData(userDataResult as UserType);
        } else {
          navigate("/error");
        }

        setUserTrades(tradesResult);
      } catch (error) {
        console.error("Error loading user data:", error);
        navigate("/error");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId, navigate]);

  if (loading) {
    return (
      <PageWrapper className="min-h-screen bg-neutral-950">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-8 bg-neutral-700 rounded-lg animate-pulse"></div>
            <div className="w-32 h-6 bg-neutral-700 rounded animate-pulse"></div>
          </div>

          {/* Profile Header Skeleton */}
          <div className="flex items-center gap-5 mb-8">
            <div className="w-24 h-24 bg-neutral-700 rounded-full animate-pulse"></div>
            <div>
              <div className="w-48 h-8 bg-neutral-700 rounded mb-2 animate-pulse"></div>
              <div className="w-32 h-4 bg-neutral-700 rounded mb-2 animate-pulse"></div>
              <div className="w-64 h-4 bg-neutral-700 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Interests Skeleton */}
          <div className="mt-6 mb-8">
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-24 h-8 bg-neutral-700 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          {/* Trades Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square bg-neutral-700 rounded-xl animate-pulse"
              ></div>
            ))}
          </div>
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

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-5">
            {userData.avatar ? (
              <img
                src={userData.avatar}
                alt={userData.displayName || userData.username}
                className="w-24 h-24 rounded-full object-cover border border-white/10"
                onError={(e) => {
                  // Hide image on error and show fallback
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden"
                  );
                }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full border border-white/10 bg-white/10 flex items-center justify-center overflow-hidden">
                <span className="text-white font-bold text-3xl">
                  {userData.displayName?.charAt(0) ||
                    userData.username?.charAt(0) ||
                    "U"}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">
                {userData.displayName || userData.username}
                {userData.country && (
                  <span> - {getFlagEmoji(userData.country)}</span>
                )}
              </h1>
              <p className="text-sm text-white/60">@{userData.username}</p>
              {userData.bio && (
                <p className="text-sm text-white/60 mt-1">{userData.bio}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Interests */}
        {userData.interests && userData.interests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-6 mb-8"
          >
            <div className="flex flex-wrap gap-3">
              {userData.interests.map((interest: string) => (
                <span
                  key={interest}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold text-white ${getEarthToneColor(
                    interest
                  )}`}
                >
                  {getInterestLabel(interest)}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Trades Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4"
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
            <>
              {userTrades.map((trade, idx) => (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="aspect-square bg-neutral-900 rounded-xl border border-neutral-700 overflow-hidden hover:border-primary transition-colors cursor-pointer"
                  onClick={() => navigate(`/trades/${trade.id}`)}
                >
                  <img
                    src={trade.images?.[0]}
                    alt={trade.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </motion.div>
              ))}
            </>
          )}
        </motion.div>
      </div>
    </PageWrapper>
  );
}
