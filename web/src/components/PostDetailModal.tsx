import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Heart,
  Bookmark,
  ExternalLink,
  ShoppingCart,
  Send,
} from "lucide-react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickerRef = useRef<HTMLDivElement | null>(null);
  const commentInputRef = useRef<HTMLInputElement | null>(null);

  const products = useBusinessProducts(post.business);

  const handleComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "posts", post.id, "comments"), {
        text: newComment.trim(),
        user: user.uid,
        timestamp: serverTimestamp(),
      });
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (commentId: string, replyToUserId: string) => {
    if (!replyText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "posts", post.id, "comments"), {
        text: replyText.trim(),
        user: user.uid,
        timestamp: serverTimestamp(),
        replyToId: commentId,
        replyToUserId,
      });
      setReplyText("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error posting reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleComment();
    }
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
            <h2 className="text-lg font-semibold">{post.title}</h2>
            <p className="text-sm text-primary/80">{post.niche}</p>
            {post.description && (
              <p className="text-sm text-white/80 mt-1">{post.description}</p>
            )}
            <p className="text-xs text-neutral-400 mt-2">
              {post.timestamp?.toDate().toLocaleString()}
            </p>
          </div>

          {/* Comments Section */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-white/60">No comments yet.</p>
                  <p className="text-xs text-white/40 mt-1">
                    Be the first to comment!
                  </p>
                </div>
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
                    isSubmitting={isSubmitting}
                  />
                ))
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="border-t border-neutral-800 p-4 space-y-4">
            {/* Like, Save, and Other Actions */}
            <div className="flex items-center gap-6">
              {post.likes !== false && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLike}
                  className="cursor-pointer hover:scale-105 transition-transform"
                >
                  {liked ? (
                    <Heart
                      size={22}
                      className="text-red-500"
                      fill="currentColor"
                    />
                  ) : (
                    <Heart
                      size={22}
                      className="text-white hover:text-red-400"
                    />
                  )}
                </motion.button>
              )}
              {post.saves !== false && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSave}
                  className="cursor-pointer hover:scale-105 transition-transform"
                >
                  {saved ? (
                    <Bookmark
                      size={22}
                      className="text-primary"
                      fill="currentColor"
                    />
                  ) : (
                    <Bookmark
                      size={22}
                      className="text-white hover:text-primary"
                    />
                  )}
                </motion.button>
              )}

              <div className="ml-auto flex items-center gap-3">
                <div className="relative" ref={pickerRef}>
                  <button
                    onClick={() => setShowPicker(!showPicker)}
                    className="cursor-pointer hover:scale-105 transition-transform"
                  >
                    <ShoppingCart
                      size={22}
                      className="text-white hover:text-primary"
                    />
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
                    className="cursor-pointer hover:scale-105 transition-transform"
                  >
                    <ExternalLink
                      size={22}
                      className="text-white hover:text-primary"
                    />
                  </a>
                )}
              </div>
            </div>

            {/* Comment Input */}
            {post.comments !== false && (
              <div className="flex items-center gap-3 bg-neutral-800/50 rounded-lg p-3">
                <input
                  ref={commentInputRef}
                  className="flex-1 bg-transparent text-white placeholder-white/60 text-sm outline-none"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSubmitting}
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleComment}
                  disabled={!newComment.trim() || isSubmitting}
                  className="text-primary hover:text-primary/80 disabled:text-white/40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={18} />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
