import { useEffect, useState, useRef, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Image as ImageIcon,
  ArrowLeft,
  Search,
  MessageSquare,
  User as UserIcon,
} from "lucide-react";
import useMediaQuery from "../hooks/useMediaQuery";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../utils/firebase";
import { useAuth } from "../hooks/useAuth";
import { useUnreadMessages } from "../hooks/useUnreadMessages";
import { useParams, useNavigate } from "react-router";
import PageWrapper from "../components/PageWrapper";
import type { User } from "../utils/types";

interface Message {
  id: string;
  text: string;
  imageUrl?: string;
  senderId: string;
  receiverId: string;
  timestamp: any;
  read: boolean;
  isSystemMessage?: boolean;
  readable?: boolean;
}

interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  lastMessageTime?: any;
  unreadCount: number;
  otherUser?: User;
  isTradeMatch?: boolean;
}

// Enhanced Desktop Chat Window Component
const DesktopChatWindow = memo(
  ({
    selectedChat,
    otherUser,
    messages,
    onNavigateToProfile,
    isLoading = false,
  }: {
    selectedChat: Chat | null;
    otherUser: User | null;
    messages: Message[];
    onNavigateToProfile: (username: string) => void;
    onClose: () => void;
    isLoading?: boolean;
  }) => {
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);

    // Enhanced auto-scroll to bottom when chat is selected or messages change
    useEffect(() => {
      if (
        selectedChat &&
        messagesEndRef.current &&
        messagesContainerRef.current
      ) {
        const scrollToBottom = () => {
          if (messagesEndRef.current && messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop =
              messagesContainerRef.current.scrollHeight;
            messagesEndRef.current.scrollIntoView({ behavior: "instant" });
            setIsAtBottom(true);
          }
        };

        scrollToBottom();
        setTimeout(scrollToBottom, 0);
        setTimeout(scrollToBottom, 100);
        setTimeout(scrollToBottom, 200);
        setTimeout(scrollToBottom, 500);
      }
    }, [selectedChat?.id, messages.length]);

    // Auto-scroll to bottom when new messages arrive and we're at the bottom
    useEffect(() => {
      if (messagesEndRef.current && isAtBottom && messages.length > 0) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [messages, isAtBottom]);

    // Handle scroll events to detect when user is at bottom
    const handleScroll = () => {
      if (!messagesContainerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setIsAtBottom(isBottom);
    };

    // Intersection Observer to mark messages as read
    useEffect(() => {
      if (!selectedChat || !user) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const messageId = entry.target.getAttribute("data-message-id");
              const isSystemMessage =
                entry.target.getAttribute("data-system-message") === "true";
              if (messageId && !isSystemMessage) {
                updateDoc(doc(db, "messages", messageId), {
                  read: true,
                }).catch(console.error);
              }
            }
          });
        },
        { threshold: 0.5 }
      );

      const unreadMessages = document.querySelectorAll("[data-message-id]");
      unreadMessages.forEach((el: Element) => {
        const messageId = el.getAttribute("data-message-id");
        const senderId = el.getAttribute("data-sender-id");
        const isSystemMessage =
          el.getAttribute("data-system-message") === "true";
        if (
          messageId &&
          senderId &&
          senderId !== user.uid &&
          !isSystemMessage
        ) {
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

        if (imageUrl) {
          messageData.imageUrl = imageUrl;
        }

        await addDoc(collection(db, "messages"), messageData);

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
      if (!selectedChat || !user) return;

      try {
        const storageRef = ref(
          storage,
          `chat-images/${selectedChat.id}/${Date.now()}-${file.name}`
        );
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

      try {
        const date = timestamp.toDate();
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = diffInMs / (1000 * 60);
        const diffInHours = diffInMinutes / 60;
        const diffInDays = diffInHours / 24;

        if (diffInMinutes < 1) return "now";
        if (diffInMinutes < 60) {
          const minutes = Math.floor(diffInMinutes);
          return `${minutes}m`;
        }
        if (diffInHours < 24) {
          const hours = Math.floor(diffInHours);
          return `${hours}h`;
        }
        if (diffInDays < 7) {
          const days = Math.floor(diffInDays);
          return `${days}d`;
        }
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      } catch (error) {
        return "";
      }
    };

    if (!selectedChat) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center bg-neutral-950">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mb-6">
            <MessageSquare size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-primary mb-2">Messages</h2>
          <p className="text-neutral-400 mb-6 max-w-md">
            Select a conversation from the sidebar to start messaging
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full"></div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex-1 flex flex-col min-h-0 bg-neutral-950">
          {/* Chat Loading Skeleton */}
          <div className="p-6 border-b border-neutral-800 bg-neutral-900 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-neutral-700 rounded-full animate-pulse flex-shrink-0"></div>
              <div className="flex-1">
                <div className="w-40 h-6 bg-neutral-700 rounded animate-pulse mb-2"></div>
                <div className="w-32 h-4 bg-neutral-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Messages Loading Skeleton */}
          <div className="flex-1 p-6 space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`flex ${
                  i % 2 === 0 ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[60%] min-w-[200px] ${
                    i % 2 === 0 ? "bg-primary" : "bg-neutral-700"
                  } rounded-2xl p-4`}
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
          <div className="p-6 border-t border-neutral-800 bg-neutral-900 flex-shrink-0">
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-neutral-700 rounded-xl animate-pulse"></div>
              <div className="w-12 h-12 bg-neutral-700 rounded-xl animate-pulse"></div>
              <div className="w-12 h-12 bg-neutral-700 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col min-h-0 bg-neutral-950">
        {/* Enhanced Chat Header */}
        <div className="p-6 border-b border-neutral-800 bg-neutral-900 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {otherUser?.avatar ? (
                <img
                  src={otherUser.avatar}
                  alt={otherUser.displayName || otherUser.username}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove(
                      "hidden"
                    );
                  }}
                />
              ) : null}
              <div
                className={`w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${
                  otherUser?.avatar ? "hidden" : ""
                }`}
              >
                {otherUser?.displayName?.charAt(0) ||
                  otherUser?.username?.charAt(0) ||
                  "U"}
              </div>
              <div className="flex-1 min-w-0">
                <h2
                  className="text-xl font-bold text-white cursor-pointer hover:text-primary transition-colors truncate"
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
                <p className="text-sm text-neutral-400 truncate">
                  {otherUser?.username ? `@${otherUser.username}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (otherUser?.username) {
                    onNavigateToProfile(otherUser.username);
                  }
                }}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-all"
              >
                <UserIcon size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Messages Area */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isSystemMessage
                  ? "justify-center"
                  : message.senderId === user?.uid
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                data-message-id={message.id}
                data-sender-id={message.senderId}
                data-system-message={message.isSystemMessage ? "true" : "false"}
                className={`${
                  message.isSystemMessage
                    ? "bg-neutral-800 text-neutral-400 text-center text-sm px-4 py-2 max-w-[400px] whitespace-nowrap rounded-full"
                    : message.senderId === user?.uid
                    ? "bg-primary text-white max-w-[60%] min-w-[100px] rounded-2xl rounded-br-md"
                    : "bg-neutral-700 text-white max-w-[60%] min-w-[100px] rounded-2xl rounded-bl-md"
                } p-4 break-words whitespace-pre-wrap shadow-lg`}
              >
                {message.imageUrl && (
                  <img
                    src={message.imageUrl}
                    alt="Message attachment"
                    className="w-full h-auto rounded-lg mb-3 max-h-64 object-cover"
                  />
                )}
                <p className="text-sm leading-relaxed">{message.text}</p>
                {!message.isSystemMessage && (
                  <p className="text-xs opacity-70 mt-2 text-right">
                    {formatTime(message.timestamp)}
                  </p>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Message Input */}
        <div className="p-6 border-t border-neutral-800 bg-neutral-900 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-neutral-800 text-white px-4 py-3 rounded-xl border border-neutral-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            <label className="cursor-pointer p-3 hover:bg-neutral-800 rounded-xl transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file);
                  }
                }}
                className="hidden"
              />
              <ImageIcon
                size={24}
                className="text-neutral-400 hover:text-white transition-colors"
              />
            </label>
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-primary text-white p-3 rounded-xl hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    );
  }
);

// Mobile Chat Window Component
const MobileChatWindow = memo(
  ({
    selectedChat,
    otherUser,
    messages,
    onNavigateToProfile,
    onBackToChats,
    isLoading = false,
  }: {
    selectedChat: Chat | null;
    otherUser: User | null;
    messages: Message[];
    onNavigateToProfile: (username: string) => void;
    onBackToChats: () => void;
    isLoading?: boolean;
  }) => {
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);

    // Enhanced auto-scroll to bottom when chat is selected or messages change
    useEffect(() => {
      if (
        selectedChat &&
        messagesEndRef.current &&
        messagesContainerRef.current
      ) {
        const scrollToBottom = () => {
          if (messagesEndRef.current && messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop =
              messagesContainerRef.current.scrollHeight;
            messagesEndRef.current.scrollIntoView({ behavior: "instant" });
            setIsAtBottom(true);
          }
        };

        scrollToBottom();
        setTimeout(scrollToBottom, 0);
        setTimeout(scrollToBottom, 100);
        setTimeout(scrollToBottom, 200);
        setTimeout(scrollToBottom, 500);
      }
    }, [selectedChat?.id, messages.length]);

    // Auto-scroll to bottom when new messages arrive and we're at the bottom
    useEffect(() => {
      if (messagesEndRef.current && isAtBottom && messages.length > 0) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [messages, isAtBottom]);

    // Handle scroll events to detect when user is at bottom
    const handleScroll = () => {
      if (!messagesContainerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setIsAtBottom(isBottom);
    };

    // Intersection Observer to mark messages as read
    useEffect(() => {
      if (!selectedChat || !user) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const messageId = entry.target.getAttribute("data-message-id");
              const isSystemMessage =
                entry.target.getAttribute("data-system-message") === "true";
              if (messageId && !isSystemMessage) {
                updateDoc(doc(db, "messages", messageId), {
                  read: true,
                }).catch(console.error);
              }
            }
          });
        },
        { threshold: 0.5 }
      );

      const unreadMessages = document.querySelectorAll("[data-message-id]");
      unreadMessages.forEach((el: Element) => {
        const messageId = el.getAttribute("data-message-id");
        const senderId = el.getAttribute("data-sender-id");
        const isSystemMessage =
          el.getAttribute("data-system-message") === "true";
        if (
          messageId &&
          senderId &&
          senderId !== user.uid &&
          !isSystemMessage
        ) {
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

        if (imageUrl) {
          messageData.imageUrl = imageUrl;
        }

        await addDoc(collection(db, "messages"), messageData);

        await updateDoc(doc(db, "chats", selectedChat.id), {
          lastMessage: {
            text: text.trim(),
            timestamp: serverTimestamp(),
          },
          lastMessageTime: serverTimestamp(),
        });

        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    };

    const handleImageUpload = async (file: File) => {
      if (!selectedChat || !user) return;

      try {
        const storageRef = ref(
          storage,
          `chat-images/${selectedChat.id}/${Date.now()}-${file.name}`
        );
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

      try {
        const date = timestamp.toDate();
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = diffInMs / (1000 * 60);
        const diffInHours = diffInMinutes / 60;
        const diffInDays = diffInHours / 24;

        if (diffInMinutes < 1) return "now";
        if (diffInMinutes < 60) {
          const minutes = Math.floor(diffInMinutes);
          return `${minutes}m`;
        }
        if (diffInHours < 24) {
          const hours = Math.floor(diffInHours);
          return `${hours}h`;
        }
        if (diffInDays < 7) {
          const days = Math.floor(diffInDays);
          return `${days}d`;
        }
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      } catch (error) {
        return "";
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: "100%" }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: "100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-0 bg-neutral-950 z-50 flex flex-col"
      >
        {/* Chat Header */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-900 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToChats}
              className="p-2 text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={24} />
            </button>

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
            ) : null}
            <span
              className={`w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center text-white font-bold ${
                otherUser?.avatar ? "hidden" : ""
              }`}
            >
              {otherUser?.displayName?.charAt(0) ||
                otherUser?.username?.charAt(0) ||
                "U"}
            </span>

            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold truncate">
                {otherUser?.displayName ||
                  otherUser?.username ||
                  "Unknown User"}
              </h3>
              <p className="text-sm text-neutral-400">
                {otherUser?.username ? `@${otherUser.username}` : ""}
              </p>
            </div>

            <button
              onClick={() => {
                if (otherUser?.username) {
                  onNavigateToProfile(otherUser.username);
                }
              }}
              className="p-2 text-neutral-400 hover:text-white transition-colors"
            >
              <UserIcon size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
        >
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-4">
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
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isSystemMessage
                    ? "justify-center"
                    : message.senderId === user?.uid
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  data-message-id={message.id}
                  data-sender-id={message.senderId}
                  data-system-message={
                    message.isSystemMessage ? "true" : "false"
                  }
                  className={`${
                    message.isSystemMessage
                      ? "bg-neutral-800 text-neutral-400 text-center text-xs px-3 py-1.5 max-w-[400px] whitespace-nowrap"
                      : message.senderId === user?.uid
                      ? "bg-primary text-white max-w-[70%] min-w-[80px]"
                      : "bg-neutral-700 text-white max-w-[70%] min-w-[80px]"
                  } rounded-lg p-2.5 break-words whitespace-pre-wrap`}
                >
                  {message.imageUrl && (
                    <img
                      src={message.imageUrl}
                      alt="Message attachment"
                      className="w-full h-auto rounded mb-2"
                    />
                  )}
                  <p className="text-sm">{message.text}</p>
                  {!message.isSystemMessage && (
                    <p className="text-xs opacity-70 mt-1">
                      {formatTime(message.timestamp)}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-neutral-800 text-white px-4 py-3 rounded-lg border border-neutral-700 focus:border-primary outline-none"
            />
            <label className="cursor-pointer p-2 hover:bg-neutral-800 rounded-lg transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file);
                  }
                }}
                className="hidden"
              />
              <ImageIcon
                size={24}
                className="text-neutral-400 hover:text-white transition-colors"
              />
            </label>
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-primary text-white p-2 rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </motion.div>
    );
  }
);

// Mobile Chat List Component
const MobileChatList = memo(
  ({
    chats,
    selectedChatId,
    onChatSelect,
    hasUnread,
    getUnreadCount,
    formatTime,
    searchQuery,
    setSearchQuery,
    chatListLoading,
  }: {
    chats: Chat[];
    selectedChatId?: string;
    onChatSelect: (chat: Chat) => void;
    hasUnread: (chatId: string) => boolean;
    getUnreadCount: (chatId: string) => number;
    formatTime: (timestamp: any) => string;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    chatListLoading: boolean;
  }) => {
    const filteredChats = useMemo(
      () =>
        chats.filter(
          (chat) =>
            chat.otherUser?.displayName
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            chat.otherUser?.username
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
        ),
      [chats, searchQuery]
    );

    return (
      <motion.div
        initial={{ opacity: 0, x: "-100%" }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: "-100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="h-full flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-900 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-primary">Messages</h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search messages"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-800 text-white px-10 py-3 rounded-lg border border-neutral-700 focus:border-primary outline-none"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {chatListLoading ? (
            // Chat List Loading Skeleton
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg"
                >
                  <div className="w-12 h-12 bg-neutral-700 rounded-full animate-pulse flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="w-24 h-4 bg-neutral-700 rounded mb-2 animate-pulse"></div>
                    <div className="w-32 h-3 bg-neutral-700 rounded animate-pulse"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : filteredChats.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-neutral-400 p-8"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={40} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                No Messages Yet
              </h2>
              <p className="text-sm text-center">
                Start connecting with other users to see your conversations here
              </p>
            </motion.div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredChats.map((chat, index) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onChatSelect(chat)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedChatId === chat.id
                      ? "bg-neutral-800"
                      : "hover:bg-neutral-800/50"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {chat.otherUser?.avatar ? (
                        <img
                          src={chat.otherUser.avatar}
                          alt={
                            chat.otherUser.displayName ||
                            chat.otherUser.username
                          }
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove(
                              "hidden"
                            );
                          }}
                        />
                      ) : null}
                      <span
                        className={`text-white font-bold text-lg ${
                          chat.otherUser?.avatar ? "hidden" : ""
                        }`}
                      >
                        {chat.otherUser?.displayName?.charAt(0) ||
                          chat.otherUser?.username?.charAt(0) ||
                          "U"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold truncate">
                          {chat.otherUser?.displayName ||
                            chat.otherUser?.username ||
                            "Unknown User"}
                        </h3>
                        {chat.lastMessageTime && (
                          <span className="text-xs text-neutral-400 flex-shrink-0 ml-2">
                            {formatTime(chat.lastMessageTime)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-400 truncate">
                        {chat.lastMessage?.imageUrl
                          ? "Image"
                          : chat.lastMessage?.text || "No messages yet"}
                      </p>
                    </div>
                    {hasUnread(chat.id) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-semibold rounded-full flex-shrink-0"
                      >
                        {getUnreadCount(chat.id) > 99
                          ? "99+"
                          : getUnreadCount(chat.id)}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }
);

// Enhanced Desktop Chat List Component
const DesktopChatList = memo(
  ({
    chats,
    selectedChatId,
    onChatSelect,
    hasUnread,
    getUnreadCount,
    formatTime,
    searchQuery,
    setSearchQuery,
    chatListLoading,
  }: {
    chats: Chat[];
    selectedChatId?: string;
    onChatSelect: (chat: Chat) => void;
    hasUnread: (chatId: string) => boolean;
    getUnreadCount: (chatId: string) => number;
    formatTime: (timestamp: any) => string;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    chatListLoading: boolean;
  }) => {
    const filteredChats = useMemo(
      () =>
        chats.filter(
          (chat) =>
            chat.otherUser?.displayName
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            chat.otherUser?.username
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
        ),
      [chats, searchQuery]
    );

    return (
      <div className="w-80 border-r border-neutral-800 bg-neutral-900 flex flex-col h-full">
        {/* Enhanced Header */}
        <div className="p-6 border-b border-neutral-800 flex-shrink-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-primary">Messages</h1>
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <MessageSquare size={20} className="text-primary" />
            </div>
          </div>

          {/* Enhanced Search */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-800 text-white px-12 py-3 rounded-xl border border-neutral-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Enhanced Chat List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {chatListLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl">
                  <div className="w-14 h-14 bg-neutral-700 rounded-full animate-pulse flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="w-28 h-5 bg-neutral-700 rounded mb-2 animate-pulse"></div>
                    <div className="w-40 h-4 bg-neutral-700 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-400 p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={40} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                No Messages Yet
              </h2>
              <p className="text-sm text-center max-w-xs">
                Start connecting with other users to see your conversations here
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredChats.map((chat, index) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onChatSelect(chat)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedChatId === chat.id
                      ? "bg-neutral-800 border border-primary/20"
                      : "hover:bg-neutral-800/50"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {chat.otherUser?.avatar ? (
                          <img
                            src={chat.otherUser.avatar}
                            alt={
                              chat.otherUser.displayName ||
                              chat.otherUser.username
                            }
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.nextElementSibling?.classList.remove(
                                "hidden"
                              );
                            }}
                          />
                        ) : null}
                        <span
                          className={`text-white font-bold text-lg ${
                            chat.otherUser?.avatar ? "hidden" : ""
                          }`}
                        >
                          {chat.otherUser?.displayName?.charAt(0) ||
                            chat.otherUser?.username?.charAt(0) ||
                            "U"}
                        </span>
                      </div>
                      {hasUnread(chat.id) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex-shrink-0 border-2 border-neutral-900"
                        >
                          {getUnreadCount(chat.id) > 99
                            ? "99+"
                            : getUnreadCount(chat.id)}
                        </motion.div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white font-semibold truncate">
                          {chat.otherUser?.displayName ||
                            chat.otherUser?.username ||
                            "Unknown User"}
                        </h3>
                        {chat.lastMessageTime && (
                          <span className="text-xs text-neutral-400 flex-shrink-0 ml-2">
                            {formatTime(chat.lastMessageTime)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-400 truncate">
                        {chat.lastMessage?.imageUrl
                          ? "📷 Image"
                          : chat.lastMessage?.text || "No messages yet"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default function Messages() {
  const { user } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { hasUnread, getUnreadCount } = useUnreadMessages();

  // State
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [chatListLoading, setChatListLoading] = useState(true);
  const [chatWindowLoading, setChatWindowLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showChatWindow, setShowChatWindow] = useState(false);

  // Memoized URL update function
  const updateURL = useCallback(
    (chat: Chat | null) => {
      if (chat) {
        const otherUserId = chat.participants.find((id) => id !== user?.uid);
        if (otherUserId) {
          window.history.replaceState(null, "", `/messages/${otherUserId}`);
        }
      } else {
        window.history.replaceState(null, "", "/messages");
      }
    },
    [user?.uid]
  );

  // Create system message for trade match
  const createTradeMatchMessage = useCallback(async (chatId: string) => {
    try {
      const systemMessageQuery = query(
        collection(db, "messages"),
        where("chatId", "==", chatId),
        where("isSystemMessage", "==", true)
      );

      const systemMessageSnap = await getDocs(systemMessageQuery);

      if (systemMessageSnap.empty) {
        await addDoc(collection(db, "messages"), {
          chatId,
          text: "🎉 You both were matched because of a trade!",
          senderId: "system",
          receiverId: "system",
          timestamp: serverTimestamp(),
          read: true,
          isSystemMessage: true,
          readable: false,
        });
      }
    } catch (error) {
      console.error("Error creating trade match message:", error);
    }
  }, []);

  // Create new chat
  const createNewChat = useCallback(
    async (otherUserId: string) => {
      if (!user) return;

      try {
        const existingChatQuery = query(
          collection(db, "chats"),
          where("participants", "array-contains", user.uid)
        );

        const existingChatSnap = await getDocs(existingChatQuery);
        const existingChat = existingChatSnap.docs.find((doc) => {
          const data = doc.data();
          return (
            data.participants.includes(otherUserId) &&
            data.participants.length === 2
          );
        });

        if (existingChat) {
          const chatData = existingChat.data() as Chat;
          const chat: Chat = {
            id: existingChat.id,
            participants: chatData.participants,
            lastMessageTime: chatData.lastMessageTime,
            unreadCount: chatData.unreadCount || 0,
          };
          setSelectedChat(chat);
          setChatWindowLoading(true);
          await createTradeMatchMessage(chat.id);
          return;
        }

        const chatRef = await addDoc(collection(db, "chats"), {
          participants: [user.uid, otherUserId].sort(),
          lastMessageTime: serverTimestamp(),
          unreadCount: 0,
        });

        const newChat: Chat = {
          id: chatRef.id,
          participants: [user.uid, otherUserId].sort(),
          lastMessageTime: serverTimestamp(),
          unreadCount: 0,
        };

        setSelectedChat(newChat);
        setChatWindowLoading(true);
        await createTradeMatchMessage(newChat.id);
      } catch (error) {
        console.error("Error creating chat:", error);
      }
    },
    [user, createTradeMatchMessage]
  );

  // Fetch user's chats
  useEffect(() => {
    if (!user) return;

    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageTime", "desc")
    );

    const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
      const chatsData: Chat[] = [];
      const seenParticipants = new Set<string>();

      for (const snapDoc of snapshot.docs) {
        const chatData = snapDoc.data() as Chat;
        chatData.id = snapDoc.id;

        const otherUserId = chatData.participants.find((id) => id !== user.uid);
        if (otherUserId) {
          const participantsKey = [user.uid, otherUserId].sort().join("_");

          if (seenParticipants.has(participantsKey)) {
            continue;
          }
          seenParticipants.add(participantsKey);

          try {
            const userDocSnap = await getDoc(doc(db, "users", otherUserId));
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data() as User;
              chatData.otherUser = userData;
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }

          chatsData.push(chatData);
        }
      }

      setChats(chatsData);
      setChatListLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Handle dynamic routes (URL-based chat selection)
  useEffect(() => {
    if (!user || !chats.length) return;

    if (userId) {
      // Find existing chat for this user
      const existingChat = chats.find((chat) =>
        chat.participants.includes(userId)
      );

      if (existingChat) {
        setSelectedChat(existingChat);
        setChatWindowLoading(true);
      } else {
        createNewChat(userId);
      }
    } else if (!userId && selectedChat) {
      // Clear selected chat when navigating to /messages
      setSelectedChat(null);
    }
  }, [userId, user, chats.length, createNewChat]);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat || !user) return;

    const messagesQuery = query(
      collection(db, "messages"),
      where("chatId", "==", selectedChat.id),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(messagesData);
      setChatWindowLoading(false);
    });

    return () => unsubscribe();
  }, [selectedChat, user]);

  // Get other user info when chat is selected
  useEffect(() => {
    if (!selectedChat || !user) {
      setOtherUser(null);
      return;
    }

    const otherUserId = selectedChat.participants.find((id) => id !== user.uid);
    if (otherUserId) {
      let isMounted = true;

      getDoc(doc(db, "users", otherUserId))
        .then((userDoc) => {
          if (!isMounted) return;

          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setOtherUser(userData);
          } else {
            setOtherUser(null);
          }
        })
        .catch((error) => {
          if (!isMounted) return;
          console.error("Error fetching other user:", error);
          setOtherUser(null);
        });

      return () => {
        isMounted = false;
      };
    } else {
      setOtherUser(null);
    }
  }, [selectedChat?.id, user?.uid]);

  // Memoized chat selection handler
  const handleChatSelect = useCallback(
    (chat: Chat) => {
      setChatWindowLoading(true);
      setSelectedChat(chat);
      if (isDesktop) {
        setShowChatWindow(true);
      }
      updateURL(chat);
    },
    [updateURL, isDesktop]
  );

  // Format time helper
  const formatTime = useCallback((timestamp: any) => {
    if (!timestamp) return "";

    try {
      const date = timestamp.toDate();
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInMinutes = diffInMs / (1000 * 60);
      const diffInHours = diffInMinutes / 60;
      const diffInDays = diffInHours / 24;

      if (diffInMinutes < 1) return "now";
      if (diffInMinutes < 60) {
        const minutes = Math.floor(diffInMinutes);
        return `${minutes}m`;
      }
      if (diffInHours < 24) {
        const hours = Math.floor(diffInHours);
        return `${hours}h`;
      }
      if (diffInDays < 7) {
        const days = Math.floor(diffInDays);
        return `${days}d`;
      }
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "";
    }
  }, []);

  const handleBackToChats = useCallback(() => {
    setSelectedChat(null);
    updateURL(null);
  }, [updateURL]);

  const clearChatWindow = useCallback(() => {
    setShowChatWindow(false);
    setSelectedChat(null);
    updateURL(null);
  }, [updateURL]);

  // Listen for clear chat window event from sidebar
  useEffect(() => {
    const handleClearChatWindow = () => {
      if (isDesktop) {
        clearChatWindow();
      }
    };

    window.addEventListener("clearChatWindow", handleClearChatWindow);
    return () => {
      window.removeEventListener("clearChatWindow", handleClearChatWindow);
    };
  }, [isDesktop, clearChatWindow]);

  return (
    <PageWrapper className="h-screen bg-neutral-950 overflow-hidden">
      {isDesktop ? (
        <div className="flex h-full">
          {/* Chat List */}
          <DesktopChatList
            chats={chats}
            selectedChatId={selectedChat?.id}
            onChatSelect={handleChatSelect}
            hasUnread={hasUnread}
            getUnreadCount={getUnreadCount}
            formatTime={formatTime}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            chatListLoading={chatListLoading}
          />

          {/* Chat Window */}
          <DesktopChatWindow
            selectedChat={showChatWindow ? selectedChat : null}
            otherUser={otherUser}
            messages={messages}
            onNavigateToProfile={(username) => navigate(`/user/${username}`)}
            onClose={clearChatWindow}
            isLoading={chatWindowLoading}
          />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {selectedChat ? (
            <MobileChatWindow
              key="chat-window"
              selectedChat={selectedChat}
              otherUser={otherUser}
              messages={messages}
              onNavigateToProfile={(username) => navigate(`/user/${username}`)}
              onBackToChats={handleBackToChats}
              isLoading={chatWindowLoading}
            />
          ) : (
            <MobileChatList
              key="chat-list"
              chats={chats}
              selectedChatId={undefined}
              onChatSelect={handleChatSelect}
              hasUnread={hasUnread}
              getUnreadCount={getUnreadCount}
              formatTime={formatTime}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              chatListLoading={chatListLoading}
            />
          )}
        </AnimatePresence>
      )}
    </PageWrapper>
  );
}
