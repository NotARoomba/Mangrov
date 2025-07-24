import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Heart, Bookmark, ExternalLink, ShoppingCart } from "lucide-react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import type { Post } from "../utils/types";
import CommentItem from "./CommentItem";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useBusinessProducts } from "../hooks/useBusinessProducts";
import ProductPicker from "./ProductPicker";

const wrapperAnim = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export default function PostDetailModal({
  post,
  onClose,
  user,
  liked,
  saved,
  handleLike,
  handleSave,
}: {
  post: Post;
  onClose: () => void;
  user: any;
  liked: boolean;
  saved: boolean;
  handleLike: () => void;
  handleSave: () => void;
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const pickerRef = useRef<HTMLDivElement | null>(null);

  const products = useBusinessProducts(post.business);

  const handleComment = async () => {
    if (!newComment.trim()) return;
    await addDoc(collection(db, "posts", post.id, "comments"), {
      text: newComment,
      user: user.uid,
      timestamp: serverTimestamp(),
    });
    setNewComment("");
  };

  const handleReply = async (commentId: string, replyToUserId: string) => {
    if (!replyText.trim()) return;
    await addDoc(collection(db, "posts", post.id, "comments"), {
      text: replyText,
      user: user.uid,
      timestamp: serverTimestamp(),
      replyToId: commentId,
      replyToUserId,
    });
    setReplyText("");
    setReplyingTo(null);
  };

  useEffect(() => {
    const q = query(
      collection(db, "posts", post.id, "comments"),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setComments(
        snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
      );
    });
    return () => unsub();
  }, [post.id]);

  // 🔒 Close picker if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    }
    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  return (
    <motion.div
      {...wrapperAnim}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:bg-neutral-800 p-2 rounded-lg transition z-50 cursor-pointer"
      >
        <X size={22} />
      </button>

      <motion.div
        key="modal"
        {...wrapperAnim}
        transition={{ duration: 0.3 }}
        className="bg-neutral-900 text-white w-full max-w-5xl h-[90vh] rounded-xl overflow-hidden flex"
      >
        {/* LEFT */}
        <div className="w-2/3 bg-black flex items-center justify-center relative">
          {!imgLoaded && (
            <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
          )}
          <Slider
            dots
            infinite
            speed={400}
            slidesToShow={1}
            slidesToScroll={1}
            arrows={false}
            className="w-full h-full"
            appendDots={(dots) => (
              <div style={{ bottom: "10px" }}>
                <ul className="flex justify-center gap-2">{dots}</ul>
              </div>
            )}
            customPaging={() => (
              <div className="w-2 h-2 bg-white/50 rounded-full" />
            )}
          >
            {post.images.map((img, index) => (
              <div
                key={index}
                className="flex justify-center items-center h-full"
              >
                <img
                  src={img}
                  alt={`Image ${index + 1}`}
                  onLoad={() => setImgLoaded(true)}
                  className={`max-h-[90vh] w-full object-cover transition-opacity duration-500 ${
                    imgLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            ))}
          </Slider>
        </div>

        {/* RIGHT */}
        <div className="w-1/3 border-l border-neutral-800 flex flex-col justify-between">
          <div className="p-4 border-b border-neutral-800">
            <h2 className="text-lg font-semibold">{post.caption}</h2>
            <p className="text-sm text-primary/80">{post.niche}</p>
            {post.description && (
              <p className="text-sm text-white/80 mt-1">{post.description}</p>
            )}
            <p className="text-xs text-neutral-400 mt-2">
              {post.date?.toDate().toLocaleString()}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[60vh] p-4 pt-2">
            {comments.length === 0 ? (
              <p className="text-xs text-white/60">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  postId={post.id}
                  comment={comment}
                  onReplyClick={(id) =>
                    setReplyingTo(replyingTo === id ? null : id)
                  }
                  isReplying={replyingTo === comment.id}
                  replyText={replyText}
                  onReplyChange={setReplyText}
                  onReplySubmit={handleReply}
                />
              ))
            )}
          </div>

          <div className="border-t border-neutral-800 p-4 space-y-3">
            <div className="flex items-center gap-6">
              {post.likes !== false && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLike}
                  className="cursor-pointer"
                >
                  {liked ? (
                    <Heart
                      size={22}
                      className="text-red-500"
                      fill="currentColor"
                    />
                  ) : (
                    <Heart size={22} className="text-white" />
                  )}
                </motion.button>
              )}
              {post.saves !== false && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSave}
                  className="cursor-pointer"
                >
                  {saved ? (
                    <Bookmark
                      size={22}
                      className="text-primary"
                      fill="currentColor"
                    />
                  ) : (
                    <Bookmark size={22} className="text-white" />
                  )}
                </motion.button>
              )}

              <div className="ml-auto flex items-center gap-3">
                <div className="relative" ref={pickerRef}>
                  <button
                    onClick={() => setShowPicker(!showPicker)}
                    className="cursor-pointer"
                  >
                    <ShoppingCart size={22} className={"text-white"} />
                  </button>

                  <AnimatePresence>
                    {showPicker && (
                      <ProductPicker
                        products={products.filter((p) =>
                          post.productIds.includes(p.id)
                        )}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {post.business && (
                  <a
                    href={`/business/${post.business}`}
                    target="_blank"
                    className="cursor-pointer"
                  >
                    <ExternalLink size={22} />
                  </a>
                )}
              </div>
            </div>

            {post.comments !== false && (
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleComment}
                  className="text-sm font-semibold text-primary hover:underline cursor-pointer"
                >
                  Post
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
