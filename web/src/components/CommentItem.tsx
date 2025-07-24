import { use, useEffect, useState } from "react";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../utils/firebase";
import { motion } from "framer-motion";
import dayjs from "dayjs";

type CommentType = {
  id: string;
  text: string;
  user: string;
  timestamp: Timestamp;
  replyToId?: string;
  replyToUserId?: string;
};

type Props = {
  postId: string;
  comment: CommentType;
  onReplyClick: (id: string) => void;
  isReplying: boolean;
  replyText: string;
  onReplyChange: (text: string) => void;
  onReplySubmit: (id: string, userId: string) => void;
};

export default function CommentItem({
  postId,
  comment,
  onReplyClick,
  isReplying,
  replyText,
  onReplyChange,
  onReplySubmit,
}: Props) {
  const [userData, setUserData] = useState<{
    avatar: string;
    name: string;
  } | null>(null);

  const [replyToName, setReplyToName] = useState<string | null>(null);
  const [isHighlighted, setIsHighlighted] = useState(false);

  const [formattedTime, setFormattedTime] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const userSnap = await getDoc(doc(db, "users", comment.user));
      if (userSnap.exists()) {
        setUserData(userSnap.data() as { avatar: string; name: string });
      }
    };
    fetchUser();
  }, [comment.user]);

  useEffect(() => {
    const fetchReplyToName = async () => {
      if (comment.replyToUserId) {
        const replyUserSnap = await getDoc(
          doc(db, "users", comment.replyToUserId)
        );
        if (replyUserSnap.exists()) {
          const data = replyUserSnap.data() as { name: string };
          setReplyToName(data.name);
        }
      }
    };
    fetchReplyToName();
  }, [comment.replyToUserId]);

  useEffect(() => {
    if (comment.timestamp) {
      const time = dayjs(comment.timestamp.toDate()).format("HH:mm");
      setFormattedTime(time);
    }
  }, [comment.timestamp]);

  const handleMouseEnter = () => {
    const target = document.querySelector(`[data-id='${comment.replyToId}']`);
    if (target) target.classList.add("bg-primary/20");
    setIsHighlighted(true);
  };

  const handleMouseLeave = () => {
    const target = document.querySelector(`[data-id='${comment.replyToId}']`);
    if (target) target.classList.remove("bg-primary/20");
    setIsHighlighted(false);
  };

  return (
    <motion.div
      data-id={comment.id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className={`group relative rounded-md p-2 transition-all duration-200 my-3 ${
        comment.replyToId ? "ml-6 border-l-4 border-primary/30 pl-4" : ""
      } ${isHighlighted ? "bg-primary/20" : "bg-neutral-800/50"}`}
    >
      <div className="flex items-start gap-3">
        <img
          src={userData?.avatar}
          alt="avatar"
          className="w-7 h-7 rounded-full object-cover"
        />
        <div className="flex flex-col w-full">
          <div className="text-white text-sm leading-tight">
            <span className="font-semibold text-primary">{userData?.name}</span>{" "}
            {replyToName && (
              <span className="text-xs text-neutral-400 ml-1">
                replying to @{replyToName}
              </span>
            )}
          </div>
          <div className="text-neutral-200 text-sm mt-1 wrap-anywhere">
            {comment.text}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 ml-10 text-xs text-neutral-400">
        <button
          onClick={() => onReplyClick(comment.id)}
          className="hover:underline cursor-pointer"
        >
          Reply
        </button>
        <span>{formattedTime}</span>
      </div>

      {isReplying && (
        <div className="mt-2 flex items-center gap-2 ">
          <input
            value={replyText}
            onChange={(e) => onReplyChange(e.target.value)}
            placeholder={`Reply to ${userData?.name || "user"}`}
            className="flex-1 bg-neutral-800 text-white px-3 py-1 rounded-md text-xs"
          />
          <button
            onClick={() => onReplySubmit(comment.id, comment.user)}
            className="text-xs text-neutral-300 hover:underline cursor-pointer"
          >
            Send
          </button>
        </div>
      )}
    </motion.div>
  );
}
