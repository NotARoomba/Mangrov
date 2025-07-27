import { useEffect, useState } from "react";
import {
  getDoc,
  doc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../hooks/useAuth";
import PageWrapper from "../components/PageWrapper";
import EditProfileModal from "../components/EditProfileModal";
import { Bookmark, Grid3x3, User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const getFlagEmoji = (countryCode: string) => {
  if (!countryCode) return "";
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
};

const getEarthToneColor = (seed: string) => {
  const earthyHexColors = [
    "bg-[#4B3B2A]",
    "bg-[#6F4E37]",
    "bg-[#A68A64]",
    "bg-[#8C6E54]",
    "bg-[#7C5C45]",
    "bg-[#D1BFA3]",
    "bg-[#A89F91]",
    "bg-[#C2B280]",
    "bg-[#5E503F]",
    "bg-[#3B3228]",
    "bg-[#556B2F]",
    "bg-[#4B5320]",
    "bg-[#2E4E3F]",
    "bg-[#3C5A4C]",
    "bg-[#6A6051]",
    "bg-[#746C57]",
    "bg-[#91876E]",
    "bg-[#5C544E]",
  ];

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % earthyHexColors.length;
  return earthyHexColors[index];
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Profile() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // 1. Fetch user data
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        if (!snap.exists()) return;

        const userDoc = snap.data();
        setUserData(userDoc);

        // 2. Fetch user's own posts
        const postsQuery = query(
          collection(db, "posts"),
          where("uid", "==", user.uid)
        );
        const postSnap = await getDocs(postsQuery);
        setUserPosts(postSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        // 3. Fetch saved posts from subcollection
        const savedSubRef = collection(db, "users", user.uid, "saves");
        const savedSnap = await getDocs(savedSubRef);

        if (savedSnap.empty) {
          setSavedPosts([]);
          return;
        }

        const savedPostIds = savedSnap.docs.map((d) => d.id).slice(0, 10); // limit to 10

        const savedPostsQuery = query(
          collection(db, "posts"),
          where("__name__", "in", savedPostIds)
        );

        const savedPostsSnap = await getDocs(savedPostsQuery);
        const allSavedPosts = savedPostsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSavedPosts(allSavedPosts);
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
      }
    };

    fetchData();
  }, [user]);

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
                  <span> - {getFlagEmoji(userData.country || "")}</span>
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
              onClick={() => setActiveTab("posts")}
              className={`flex items-center justify-center gap-1 px-6 py-3 text-sm font-medium transition w-1/2 cursor-pointer ${
                activeTab === "posts"
                  ? "border-t-2 border-white"
                  : "text-white/40"
              }`}
            >
              <Grid3x3 size={18} />
              Posts
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
            {(activeTab === "posts" ? userPosts : savedPosts).map(
              (post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative aspect-square overflow-hidden rounded-xl bg-white/10 cursor-pointer"
                >
                  <img
                    src={post.images?.[0]}
                    alt={post.caption || "Post"}
                    className="object-cover w-full h-full"
                  />
                </motion.div>
              )
            )}

            {activeTab === "posts" && userPosts.length === 0 && (
              <p className="text-sm text-white/40 col-span-full text-center">
                You haven't posted anything yet.
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
      </AnimatePresence>
    </PageWrapper>
  );
}
