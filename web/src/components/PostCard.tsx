import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Bookmark, Heart, ChevronDown, ChevronUp } from "lucide-react";
import type { Post } from "../utils/types";
import { db } from "../utils/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";

// Earth tone color generator using hex values
const getEarthToneColor = (seed: string) => {
  const earthyColors = [
    "bg-[#6B4C3B]", // dark brown
    "bg-[#8C6E54]", // warm beige-brown
    "bg-[#A89F91]", // stone beige
    "bg-[#C1B7A3]", // light khaki
    "bg-[#7A6A53]", // dark taupe
    "bg-[#3E4B3C]", // deep olive
    "bg-[#5B7B5C]", // earthy green
    "bg-[#2F3E46]", // dark blue-grey
    "bg-[#4F5D2F]", // olive
    "bg-[#A68A64]", // caramel
    "bg-[#726A5C]", // weathered stone
    "bg-[#4B3621]", // dark coffee
    "bg-[#B8A57F]", // sand
  ];

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % earthyColors.length;
  return earthyColors[index];
};

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
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (user) {
      setLiked(post.likes?.includes(user.uid) || false);
      setSaved(userSavedPosts.includes(post.id));
    }
  }, [user, userSavedPosts, post.likes]);

  const handleLike = async () => {
    const postRef = doc(db, "posts", post.id);
    const newLiked = !liked;
    setLiked(newLiked);

    await updateDoc(postRef, {
      likes: newLiked ? arrayUnion(user?.uid) : arrayRemove(user?.uid),
    });
  };

  const handleSave = async () => {
    const userRef = doc(db, "users", user?.uid as string);
    const newSaved = !saved;
    setSaved(newSaved);

    await updateDoc(userRef, {
      savedPosts: newSaved ? arrayUnion(post.id) : arrayRemove(post.id),
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.03,
        duration: 0.3,
        ease: "easeOut",
      }}
      className="relative group rounded-xl overflow-hidden shadow-md bg-neutral-800 w-full"
    >
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse rounded-xl bg-neutral-700 z-50" />
      )}

      <img
        src={post.images[0]}
        alt={post.caption}
        loading="lazy"
        onLoad={onImageLoad}
        className={`w-full h-auto object-cover rounded-xl transition-all duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ aspectRatio: "3 / 4", objectFit: "cover" }}
      />

      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 z-20">
        <div className="flex justify-between items-end w-full gap-4">
          {/* TEXT LEFT */}
          <div className="flex flex-col text-white text-left">
            <div className="text-base font-semibold mb-1">{post.caption}</div>

            <AnimatePresence>
              <motion.div
                layout
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm overflow-hidden"
              >
                {expanded ? (
                  <p>
                    {post.keywords
                      .concat(post.niche)
                      .map(
                        (item) =>
                          item[0].toUpperCase() + item.slice(1).toLowerCase()
                      )
                      .join(", ")}
                  </p>
                ) : (
                  <p className="truncate">
                    {post.keywords
                      .concat(post.niche)
                      .map(
                        (item) =>
                          item[0].toUpperCase() + item.slice(1).toLowerCase()
                      )
                      .join(", ")}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

            {post.keywords.concat(post.niche).join(", ").length > 40 && (
              <motion.button
                layout
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-blue-300 hover:underline mt-1 flex items-center gap-1"
              >
                {expanded ? "View less" : "View more"}
                {expanded ? (
                  <ChevronUp size={12} className="mt-[1px]" />
                ) : (
                  <ChevronDown size={12} className="mt-[1px]" />
                )}
              </motion.button>
            )}
          </div>

          {/* ICONS RIGHT */}
          <div className="flex-shrink-0 flex flex-row items-end gap-2 text-white text-base">
            <button className="flex items-center gap-1" onClick={handleLike}>
              <Heart
                size={28}
                className={liked ? "text-red-500" : "text-white"}
                strokeWidth={2}
                fill={liked ? "currentColor" : "none"}
              />
              <span className="text-sm">
                {(post.likes?.length ?? 0) +
                  (liked && !post.likes?.includes(user?.uid as string)
                    ? 1
                    : 0) -
                  (!liked && post.likes?.includes(user?.uid as string) ? 1 : 0)}
              </span>
            </button>

            <button className="flex items-center gap-1" onClick={handleSave}>
              <Bookmark
                size={28}
                className={saved ? "text-green-500" : "text-white"}
                strokeWidth={2}
                fill={saved ? "currentColor" : "none"}
              />
              <span className="text-sm">{post.saves ?? 0}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
