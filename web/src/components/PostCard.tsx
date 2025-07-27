import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Bookmark, Heart, ChevronDown, ChevronUp } from "lucide-react";
import type { Post } from "../utils/types";
import { db } from "../utils/firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import PostDetailModal from "./PostDetailModal";

export default function PostCard({
  post,
  index,
  isLoaded,
  onImageLoad,
  userSavedPosts = [],
}: {
  post: Post;
  index: number;
  isLoaded: boolean;
  onImageLoad: () => void;
  userSavedPosts?: string[];
}) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!user || !post?.id) return;

    const likeDocRef = doc(db, "posts", post.id, "likes", user.uid);
    const likeCollectionRef = collection(db, "posts", post.id, "likes");

    const unsubscribe = onSnapshot(likeCollectionRef, (snapshot) => {
      setLikeCount(snapshot.size);
    });

    getDoc(likeDocRef).then((docSnap) => {
      setLiked(docSnap.exists());
    });

    setSaved(userSavedPosts.includes(post.id));

    return () => unsubscribe();
  }, [user, post, userSavedPosts]);

  const handleLike = async () => {
    setLiked(!liked);
    if (!user) return;
    const likeDocRef = doc(db, "posts", post.id, "likes", user.uid);

    if (liked) {
      await deleteDoc(likeDocRef);
    } else {
      await setDoc(likeDocRef, {
        timestamp: Date.now(),
      });
    }
  };

  const handleSave = async () => {
    setSaved(!saved);
    const saveDocRef = doc(db, "users", user?.uid as string, "saves", post.id);
    if (saved) {
      await deleteDoc(saveDocRef);
    } else {
      await setDoc(saveDocRef, { timestamp: Date.now() });
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: index * 0.03,
          duration: 0.3,
          ease: "easeOut",
        }}
        className="relative group rounded-xl overflow-hidden shadow-md bg-neutral-800 w-full cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        {!isLoaded && (
          <div className="absolute inset-0 animate-pulse rounded-xl bg-neutral-700 z-50" />
        )}

        <img
          src={post.images[0]}
          alt={post.title}
          loading="lazy"
          onLoad={onImageLoad}
          className={`w-full h-auto object-cover rounded-xl transition-all duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ aspectRatio: "3 / 4" }}
        />

        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 z-20">
          <div className="flex justify-between items-end w-full gap-4">
            <div className="flex flex-col text-white text-left">
              <div className="text-base font-semibold mb-1">{post.title}</div>
              <AnimatePresence>
                <motion.div
                  layout
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm overflow-hidden"
                >
                  <p className={expanded ? "" : "truncate"}>
                    {post.keywords
                      .concat(post.niche)
                      .map(
                        (item) =>
                          item[0].toUpperCase() + item.slice(1).toLowerCase()
                      )
                      .join(", ")}
                  </p>
                </motion.div>
              </AnimatePresence>

              {post.keywords.concat(post.niche).join(", ").length > 40 && (
                <motion.button
                  layout
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                  }}
                  className="text-xs text-blue-300 hover:underline mt-1 flex items-center gap-1"
                >
                  {expanded ? "View less" : "View more"}
                  {expanded ? (
                    <ChevronUp size={12} />
                  ) : (
                    <ChevronDown size={12} />
                  )}
                </motion.button>
              )}
            </div>

            <div
              className="flex-shrink-0 flex flex-row items-end gap-2 text-white text-base"
              onClick={(e) => e.stopPropagation()}
            >
              {post.likes && (
                <button
                  onClick={handleLike}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <Heart
                    size={28}
                    className={liked ? "text-red-500" : "text-white"}
                    strokeWidth={2}
                    fill={liked ? "currentColor" : "none"}
                  />
                  <span className="text-sm">{likeCount}</span>
                </button>
              )}

              {post.saves && (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <Bookmark
                    size={28}
                    className={saved ? "text-green-500" : "text-white"}
                    strokeWidth={2}
                    fill={saved ? "currentColor" : "none"}
                  />
                  {/* <span className="text-sm">{post.saves?.length ?? 0}</span> */}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <PostDetailModal
            post={post}
            user={user}
            onClose={() => setShowModal(false)}
            liked={liked}
            saved={saved}
            handleLike={handleLike}
            handleSave={handleSave}
          />
        )}
      </AnimatePresence>
    </>
  );
}
