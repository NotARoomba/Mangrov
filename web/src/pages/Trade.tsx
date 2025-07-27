import { useEffect, useState, useCallback, useMemo } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import { INTERESTS } from "../utils/constants";
import { useSwipeable } from "react-swipeable";
import {
  X,
  Heart,
  MessageCircle,
  ArrowLeft,
  ArrowRight,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router";

interface Post {
  id: string;
  title: string;
  description: string;
  images: string[];
  niche: string[];
  uid?: string;
}

interface TradeMatch {
  id: string;
  fromUser: string;
  toUser: string;
  fromItem: string;
  toItem: string;
  fromLiked: boolean;
  toLiked: boolean;
  timestamp: any;
}

export default function Trade() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<null | "left" | "right">(
    null
  );
  const [randomMode, setRandomMode] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [currentTradePost, setCurrentTradePost] = useState<Post | null>(null);
  const [matches, setMatches] = useState<TradeMatch[]>([]);
  const [activeTab, setActiveTab] = useState<"swipe" | "matches">("swipe");
  const [loading, setLoading] = useState(true);

  // Fetch user's interests
  useEffect(() => {
    if (!user) return;
    const fetchUserInterests = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const data = userDoc.data();
      if (data?.interests) {
        setUserInterests(data.interests);
        setSelectedNiches(data.interests);
      }
    };
    fetchUserInterests();
  }, [user]);

  // Fetch user's trades for trading
  useEffect(() => {
    if (!user) return;
    const fetchUserTrades = async () => {
      const q = query(collection(db, "trades"), where("uid", "==", user.uid));
      const snap = await getDocs(q);
      const result = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setUserPosts(result);
    };
    fetchUserTrades();
  }, [user]);

  // Fetch matches
  useEffect(() => {
    if (!user) return;
    const fetchMatches = async () => {
      const q = query(
        collection(db, "tradeMatches"),
        where("fromUser", "==", user.uid)
      );
      const snap = await getDocs(q);
      const result = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TradeMatch[];
      setMatches(result);
    };
    fetchMatches();
  }, [user]);

  // Memoized fetch posts function to prevent rerenders
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    let result: Post[] = [];
    if (randomMode) {
      // Fetch all trades except user's own
      const snap = await getDocs(collection(db, "trades"));
      result = snap.docs
        .filter((doc) => doc.data().uid !== user?.uid) // Filter out user's own trades
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[];
    } else if (selectedNiches.length > 0) {
      // Firestore only allows up to 10 values in 'in' query
      const batches = [];
      for (let i = 0; i < selectedNiches.length; i += 10) {
        const batch = selectedNiches.slice(i, i + 10);
        const q = query(
          collection(db, "trades"),
          where("niche", "array-contains-any", batch)
        );
        batches.push(getDocs(q));
      }
      const snaps = await Promise.all(batches);
      result = snaps.flatMap(
        (snap) =>
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Post[]
      );
      // Remove duplicates and user's own posts
      const seen = new Set();
      result = result.filter((post) => {
        if (seen.has(post.id) || post.uid === user?.uid) return false;
        seen.add(post.id);
        return true;
      });
    }
    setPosts(result);
    setCurrentIndex(0);
    setLoading(false);
  }, [selectedNiches, randomMode, user]);

  // Memoized filter handlers to prevent rerenders
  const handleRandomModeChange = useCallback((checked: boolean) => {
    setRandomMode(checked);
  }, []);

  const handleNicheChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selected = Array.from(
        e.target.selectedOptions,
        (option) => option.value
      );
      setSelectedNiches(selected);
      setRandomMode(false);
    },
    []
  );

  // Fetch posts when dependencies change
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const swipeLeft = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, posts.length - 1));
  };

  const swipeRight = async () => {
    // Like logic - check if there's a match
    const currentPost = posts[currentIndex];
    if (currentPost && user) {
      // Check if the other user has already liked one of our items
      const existingMatch = matches.find(
        (match) =>
          match.toUser === currentPost.uid && match.toItem === currentPost.id
      );

      if (existingMatch) {
        // Update existing match
        await updateDoc(doc(db, "tradeMatches", existingMatch.id), {
          fromLiked: true,
        });
      } else {
        // Create new match record
        await addDoc(collection(db, "tradeMatches"), {
          fromUser: user.uid,
          toUser: currentPost.uid,
          fromItem: "", // Will be set when user selects their item
          toItem: currentPost.id,
          fromLiked: true,
          toLiked: false,
          timestamp: new Date(),
        });
      }
    }
    setCurrentIndex((prev) => Math.min(prev + 1, posts.length - 1));
  };

  // Swipe handlers
  const handleSwipe = (dir: "left" | "right") => {
    if (isAnimating) return;

    if (dir === "left") {
      // Show product picker for pass
      setCurrentTradePost(posts[currentIndex]);
      setShowProductPicker(true);
    } else {
      setSwipeDirection(dir);
      setIsAnimating(true);
      setTimeout(() => {
        swipeRight();
        setIsAnimating(false);
        setSwipeDirection(null);
      }, 350);
    }
  };

  const handleItemSelect = async (selectedItem: Post) => {
    if (!currentTradePost || !user) return;

    // Create or update match record
    const existingMatch = matches.find(
      (match) =>
        match.toUser === currentTradePost.uid &&
        match.toItem === currentTradePost.id
    );

    if (existingMatch) {
      await updateDoc(doc(db, "tradeMatches", existingMatch.id), {
        fromItem: selectedItem.id,
        fromLiked: true,
      });
    } else {
      await addDoc(collection(db, "tradeMatches"), {
        fromUser: user.uid,
        toUser: currentTradePost.uid,
        fromItem: selectedItem.id,
        toItem: currentTradePost.id,
        fromLiked: true,
        toLiked: false,
        timestamp: new Date(),
      });
    }

    setShowProductPicker(false);
    setCurrentTradePost(null);
    swipeLeft();
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("left"),
    onSwipedRight: () => handleSwipe("right"),
    trackMouse: true,
  });

  const currentPost = posts[currentIndex];

  // Memoized swipe area to prevent rerenders
  const swipeArea = useMemo(
    () => (
      <div className="relative w-full max-w-md h-[500px] flex items-center justify-center select-none">
        {/* Card stack */}
        {posts.slice(currentIndex, currentIndex + 2).map((post, idx) => {
          const isTop = idx === 0;
          const offset = idx * 10;
          const scale = 1 - idx * 0.04;
          return (
            <AnimatePresence key={post.id}>
              {isTop ? (
                <motion.div
                  {...swipeHandlers}
                  key={post.id}
                  className="absolute w-full h-full flex flex-col items-center justify-center cursor-pointer"
                  style={{ zIndex: 2 }}
                  initial={{
                    x: swipeDirection === "left" ? 0 : 0,
                    opacity: 1,
                    scale: 1,
                  }}
                  animate={{
                    x: isAnimating
                      ? swipeDirection === "left"
                        ? -500
                        : 500
                      : 0,
                    opacity: isAnimating ? 0 : 1,
                    scale: 1,
                  }}
                  exit={{
                    x: swipeDirection === "left" ? -500 : 500,
                    opacity: 0,
                    scale: 0.95,
                  }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="w-full h-full bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-4 flex flex-col items-center text-center border-2 border-neutral-800">
                    <img
                      src={post.images?.[0]}
                      alt={post.title}
                      className="w-full h-64 object-cover rounded-xl mb-4 border border-neutral-700"
                    />
                    <h2 className="text-2xl font-bold mb-2 text-neutral-900 dark:text-white">
                      {post.title}
                    </h2>
                    <p className="text-base mt-2 text-neutral-500 dark:text-neutral-300">
                      {post.description}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={post.id}
                  className="absolute w-full h-full flex flex-col items-center justify-center"
                  style={{ zIndex: 1, top: offset, scale, opacity: 0.7 }}
                  initial={{ scale: 0.96, opacity: 0.7 }}
                  animate={{ scale, opacity: 0.7 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-full h-full bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-4 flex flex-col items-center text-center border border-neutral-800">
                    <img
                      src={post.images?.[0]}
                      alt={post.title}
                      className="w-full h-64 object-cover rounded-xl mb-4 border border-neutral-700"
                    />
                    <h2 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">
                      {post.title}
                    </h2>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          );
        })}
        {posts.length === 0 && (
          <div className="absolute w-full h-full flex items-center justify-center text-neutral-400 text-lg">
            No posts found for this niche.
          </div>
        )}
      </div>
    ),
    [posts, currentIndex, swipeDirection, isAnimating, swipeHandlers]
  );

  const primaryBtn =
    "bg-primary text-primary-foreground hover:bg-primary/80 cursor-pointer transition-all duration-200 active:scale-95 uppercase tracking-widest font-bold disabled:opacity-40 disabled:cursor-not-allowed";
  const mutedInput =
    "rounded-md bg-muted px-3 py-2 text-sm sm:text-base outline-none focus:ring-2 ring-primary/80 transition-all duration-200";

  if (loading) {
    return (
      <PageWrapper className="flex flex-col items-center justify-center min-h-screen space-y-6 bg-neutral-950">
        {/* Tabs Skeleton */}
        <div className="w-full max-w-md flex border-b border-neutral-700">
          <div className="flex-1 py-2">
            <div className="w-16 h-4 bg-neutral-700 rounded mx-auto animate-pulse"></div>
          </div>
          <div className="flex-1 py-2">
            <div className="w-20 h-4 bg-neutral-700 rounded mx-auto animate-pulse"></div>
          </div>
        </div>

        {/* Filter Skeleton */}
        <div className="w-full max-w-md space-y-4">
          <div className="w-full h-4 bg-neutral-700 rounded animate-pulse"></div>
          <div className="w-full h-10 bg-neutral-700 rounded animate-pulse"></div>
        </div>

        {/* Card Skeleton */}
        <div className="relative w-full max-w-md h-[500px] flex items-center justify-center">
          <div className="w-full h-full bg-neutral-900 rounded-2xl shadow-2xl p-4 flex flex-col items-center text-center border-2 border-neutral-800">
            <div className="w-full h-64 bg-neutral-800 rounded-xl mb-4 animate-pulse"></div>
            <div className="w-3/4 h-8 bg-neutral-800 rounded mb-2 animate-pulse"></div>
            <div className="w-full h-4 bg-neutral-800 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Progress Skeleton */}
        <div className="w-32 h-4 bg-neutral-700 rounded animate-pulse"></div>

        {/* Buttons Skeleton */}
        <div className="flex space-x-8 mt-2 w-full max-w-xs">
          <div className="w-1/2 h-10 bg-neutral-700 rounded-md animate-pulse"></div>
          <div className="w-1/2 h-10 bg-neutral-700 rounded-md animate-pulse"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="min-h-screen bg-neutral-950">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-neutral-950/95 backdrop-blur-sm border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-center">
            <div className="flex border-b border-neutral-700">
              <button
                onClick={() => setActiveTab("swipe")}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition cursor-pointer ${
                  activeTab === "swipe"
                    ? "text-primary border-b-2 border-primary"
                    : "text-neutral-400 hover:text-neutral-300"
                }`}
              >
                <Filter size={16} />
                Discover
              </button>
              <button
                onClick={() => setActiveTab("matches")}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition cursor-pointer ${
                  activeTab === "matches"
                    ? "text-primary border-b-2 border-primary"
                    : "text-neutral-400 hover:text-neutral-300"
                }`}
              >
                <MessageCircle size={16} />
                Matches ({matches.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === "swipe" ? (
            <motion.div
              key="swipe"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center"
            >
              {/* Main Swipe Area - Centered */}
              <div className="flex flex-col items-center justify-center space-y-6">
                {swipeArea}

                {/* Progress indicator */}
                <div className="text-neutral-400 text-sm mb-2">
                  {posts.length > 0 && (
                    <span>
                      Card {currentIndex + 1} of {posts.length}
                    </span>
                  )}
                </div>

                <div className="flex space-x-8 mt-2 w-full max-w-xs">
                  <button
                    onClick={() => handleSwipe("left")}
                    disabled={isAnimating || currentIndex >= posts.length}
                    className={`w-1/2 rounded-md py-2 ${primaryBtn}`}
                  >
                    <X className="w-5 h-5 mx-auto" />
                    Pass
                  </button>
                  <button
                    onClick={() => handleSwipe("right")}
                    disabled={isAnimating || currentIndex >= posts.length}
                    className={`w-1/2 rounded-md py-2 ${primaryBtn}`}
                  >
                    <Heart className="w-5 h-5 mx-auto" />
                    Like
                  </button>
                </div>
              </div>

              {/* Filters Sidebar - Absolute positioned */}
              <div className="fixed right-8 top-1/2 transform -translate-y-1/2 w-80">
                <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800 shadow-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Filter size={20} />
                    Filters
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={randomMode}
                          onChange={(e) =>
                            handleRandomModeChange(e.target.checked)
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                      <span className="text-white text-sm">
                        Random Mode (show all)
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Filter by Interests
                      </label>
                      <select
                        className={`w-full ${mutedInput} cursor-pointer`}
                        value={selectedNiches}
                        onChange={handleNicheChange}
                        multiple
                        disabled={randomMode}
                        size={Math.min(userInterests.length, 6) || 2}
                      >
                        {userInterests.map((interest) => (
                          <option key={interest} value={interest}>
                            {INTERESTS.find((i) => i.id === interest)?.label ||
                              interest}
                          </option>
                        ))}
                      </select>
                      {!randomMode && userInterests.length > 1 && (
                        <div className="text-xs text-neutral-400 mt-1">
                          Hold Ctrl (Cmd on Mac) to select multiple interests
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="matches"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="space-y-4">
                {matches.length === 0 ? (
                  <div className="text-center text-neutral-400 py-16">
                    <Heart className="w-16 h-16 mx-auto mb-6 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">
                      No matches yet
                    </h3>
                    <p className="text-neutral-500">
                      Start swiping to find trades!
                    </p>
                  </div>
                ) : (
                  matches.map((match) => (
                    <motion.div
                      key={match.id}
                      className="bg-neutral-900 rounded-xl p-6 border border-neutral-700 cursor-pointer hover:border-primary transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-neutral-400">Match</span>
                        <button
                          onClick={() => navigate(`/messages/${match.toUser}`)}
                          className="text-primary hover:text-primary/80 transition cursor-pointer"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-white text-sm">
                        {match.fromLiked && match.toLiked
                          ? "Mutual match!"
                          : "Pending match"}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Picker Modal */}
      <AnimatePresence>
        {showProductPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">
                  Select Your Item to Trade
                </h3>
                <button
                  onClick={() => setShowProductPicker(false)}
                  className="text-neutral-400 hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-3">
                {userPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    onClick={() => handleItemSelect(post)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-neutral-700 hover:border-primary cursor-pointer transition-all duration-200 hover:bg-neutral-800"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <img
                      src={post.images?.[0]}
                      alt={post.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{post.title}</h4>
                      <p className="text-sm text-neutral-400">
                        {post.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-neutral-400" />
                  </motion.div>
                ))}
              </div>

              {userPosts.length === 0 && (
                <div className="text-center text-neutral-400 py-8">
                  <p>You need to add some trades first!</p>
                  <motion.button
                    onClick={() => navigate("/add")}
                    className={`mt-4 px-6 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/80 cursor-pointer transition-all duration-200 active:scale-95 uppercase tracking-wide font-bold`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ADD TRADE
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
