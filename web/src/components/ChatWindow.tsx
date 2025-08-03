import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Image as ImageIcon } from "lucide-react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../utils/firebase";
import { useAuth } from "../hooks/useAuth";
import type { Chat, Message, User } from "../utils/types";

interface ChatWindowProps {
  selectedChat: Chat | null;
  otherUser: User | null;
  messages: Message[];
  onNavigateToProfile: (username: string) => void;
  isLoading?: boolean;
}

export default function ChatWindow({
  selectedChat,
  otherUser,
  messages,
  onNavigateToProfile,
  isLoading = false,
}: ChatWindowProps) {
  const { user } = useAuth();

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && isAtBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  // Auto-scroll to bottom when chat is first selected
  useEffect(() => {
    if (selectedChat && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      setIsAtBottom(true);
    }
  }, [selectedChat?.id]);

  // Handle scroll events to detect when user is at bottom
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    const isBottom = scrollTop + clientHeight >= scrollHeight - 10;
    setIsAtBottom(isBottom);
  };

  // Intersection Observer to mark messages as read when they come into viewport
  useEffect(() => {
    if (!selectedChat || !user) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute("data-message-id");
            if (messageId) {
              // Mark message as read in Firestore
              updateDoc(doc(db, "messages", messageId), {
                read: true,
              }).catch(console.error);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe all unread messages from other users
    const unreadMessages = document.querySelectorAll("[data-message-id]");
    unreadMessages.forEach((el: Element) => {
      const messageId = el.getAttribute("data-message-id");
      const senderId = el.getAttribute("data-sender-id");
      if (messageId && senderId && senderId !== user.uid) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [messages, selectedChat, user]);

  const sendMessage = async (text: string, imageUrl?: string) => {
    if (!selectedChat || !user || (!text.trim() && !imageUrl)) return;

    try {
      const messageData: any = {
        chatId: selectedChat.id,
        text: text.trim(),
        senderId: user.uid,
        receiverId: selectedChat.participants.find((id) => id !== user.uid),
        timestamp: serverTimestamp(),
        read: false,
      };

      // Only add imageUrl if it exists
      if (imageUrl) {
        messageData.imageUrl = imageUrl;
      }

      await addDoc(collection(db, "messages"), messageData);

      // Update chat's last message
      await updateDoc(doc(db, "chats", selectedChat.id), {
        lastMessage: {
          text: text.trim() || "Image",
          senderId: user.uid,
        },
        lastMessageTime: serverTimestamp(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    try {
      const storageRef = ref(storage, `chat-images/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await sendMessage("", downloadURL);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return "now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <AnimatePresence mode="wait">
        {!selectedChat ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mb-6">
              <Send size={48} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-primary mb-2">Messages</h2>
            <p className="text-neutral-400 mb-6">
              Select a chat to start messaging
            </p>
          </motion.div>
        ) : isLoading ? (
          <motion.div
            key="chat-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Chat Loading Skeleton */}
            <div className="p-4 border-b border-neutral-800 bg-neutral-900 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-700 rounded-full animate-pulse flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="w-32 h-5 bg-neutral-700 rounded animate-pulse mb-1"></div>
                  <div className="w-24 h-3 bg-neutral-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Messages Loading Skeleton */}
            <div className="flex-1 p-4 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex ${
                    i % 2 === 0 ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] min-w-[200px] ${
                      i % 2 === 0 ? "bg-primary" : "bg-neutral-700"
                    } rounded-lg p-3`}
                  >
                    <div
                      className={`w-48 h-4 ${
                        i % 2 === 0 ? "bg-primary/80" : "bg-neutral-600"
                      } rounded animate-pulse`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Loading Skeleton */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-900 flex-shrink-0">
              <div className="flex gap-2">
                <div className="flex-1 h-10 bg-neutral-700 rounded-lg animate-pulse"></div>
                <div className="w-10 h-10 bg-neutral-700 rounded-lg animate-pulse"></div>
                <div className="w-10 h-10 bg-neutral-700 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-neutral-800 bg-neutral-900 flex-shrink-0">
              <div className="flex items-center gap-3">
                {otherUser?.avatar ? (
                  <img
                    src={otherUser.avatar}
                    alt={otherUser.displayName || otherUser.username}
                    className="w-10 h-10 rounded-full object-cover border border-white/10 flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling?.classList.remove(
                        "hidden"
                      );
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full border border-white/10 bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {otherUser?.displayName?.charAt(0) ||
                        otherUser?.username?.charAt(0) ||
                        "U"}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2
                    className="text-lg font-semibold text-white cursor-pointer hover:text-primary transition-colors truncate"
                    onClick={() => {
                      if (otherUser?.username) {
                        onNavigateToProfile(otherUser.username);
                      }
                    }}
                  >
                    {otherUser?.displayName ||
                      otherUser?.username ||
                      "Unknown User"}
                  </h2>
                  <span className="text-sm text-neutral-400 truncate">
                    @{otherUser?.username || "unknown"}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4"
            >
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    data-message-id={message.id}
                    data-sender-id={message.senderId}
                    className={`flex ${
                      message.senderId === user?.uid
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] min-w-[200px] ${
                        message.isSystemMessage
                          ? "bg-neutral-700 text-center mx-auto"
                          : message.senderId === user?.uid
                          ? "bg-primary text-white"
                          : "bg-neutral-700 text-white"
                      } rounded-lg p-3 break-words`}
                    >
                      {message.imageUrl && (
                        <img
                          src={message.imageUrl}
                          alt="Message"
                          className="w-full h-auto rounded mb-2"
                        />
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.text}
                      </p>
                      {!message.isSystemMessage && (
                        <p className="text-xs opacity-60 mt-1">
                          {formatTime(message.timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-900 flex-shrink-0">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-neutral-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ring-primary min-w-0"
                />
                <label className="cursor-pointer flex-shrink-0">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="hidden"
                  />
                  <ImageIcon
                    size={20}
                    className="text-neutral-400 hover:text-primary transition-colors"
                  />
                </label>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-primary text-white p-2 rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
