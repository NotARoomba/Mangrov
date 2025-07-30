import { useEffect, useState, useRef, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Image as ImageIcon, ArrowLeft } from "lucide-react";
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
import { useParams, useNavigate, useLocation } from "react-router";
import PageWrapper from "../components/PageWrapper";
import { Search } from "lucide-react";
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

// ChatWindow Component
const ChatWindow = memo(
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
    onNavigateToProfile: (userId: string) => void;
    isLoading?: boolean;
  }) => {
    const { user } = useAuth();
    const { markAsRead } = useUnreadMessages();
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
        // Multiple attempts to ensure scroll works
        const scrollToBottom = () => {
          if (messagesEndRef.current && messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop =
              messagesContainerRef.current.scrollHeight;
            messagesEndRef.current.scrollIntoView({ behavior: "instant" });
            setIsAtBottom(true);
          }
        };

        // Immediate scroll
        scrollToBottom();

        // Additional attempts with delays to ensure it works
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

    // Intersection Observer to mark messages as read when they come into viewport
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
                // Mark message as read in Firestore (skip system messages)
                updateDoc(doc(db, "messages", messageId), {
                  read: true,
                }).catch(console.error);
              }
            }
          });
        },
        { threshold: 0.5 }
      );

      // Observe all unread messages from other users (skip system messages)
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
      console.log("sendMessage called with:", {
        text,
        imageUrl,
        selectedChat: selectedChat?.id,
        user: user?.uid,
      });
      if (!selectedChat || !user || (!text.trim() && !imageUrl)) {
        console.log("sendMessage early return - missing data");
        return;
      }

      try {
        console.log("Adding message to Firestore");
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

        console.log("Updating chat's last message");
        // Update chat's last message
        await updateDoc(doc(db, "chats", selectedChat.id), {
          lastMessage: {
            text: text.trim(),
            timestamp: serverTimestamp(),
          },
          lastMessageTime: serverTimestamp(),
        });

        console.log("Message sent successfully");
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

        // Less than 1 minute
        if (diffInMinutes < 1) return "now";

        // Less than 1 hour
        if (diffInMinutes < 60) {
          const minutes = Math.floor(diffInMinutes);
          return `${minutes}m`;
        }

        // Less than 24 hours
        if (diffInHours < 24) {
          const hours = Math.floor(diffInHours);
          return `${hours}h`;
        }

        // Less than 7 days
        if (diffInDays < 7) {
          const days = Math.floor(diffInDays);
          return `${days}d`;
        }

        // More than 7 days - show date
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      } catch (error) {
        return "";
      }
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
                      const otherUserId = selectedChat?.participants.find(
                        (id) => id !== user?.uid
                      );
                      if (otherUserId) {
                        onNavigateToProfile(otherUserId);
                      }
                    }}
                    className="p-2 text-neutral-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
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
                      data-system-message={
                        message.isSystemMessage ? "true" : "false"
                      }
                      className={`${
                        message.isSystemMessage
                          ? "bg-neutral-800 text-neutral-400 text-center text-xs px-3 py-1.5 max-w-[400px] whitespace-nowrap"
                          : message.senderId === user?.uid
                          ? "bg-primary text-white max-w-[45%] min-w-[80px]"
                          : "bg-neutral-700 text-white max-w-[45%] min-w-[80px]"
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
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-neutral-800 bg-neutral-900 flex-shrink-0">
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center gap-3"
                >
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
          )}
        </AnimatePresence>
      </div>
    );
  }
);

// ChatList Component
const ChatList = memo(
  ({
    chats,
    selectedChatId,
    onChatSelect,
    hasUnread,
    getUnreadCount,
    formatTime,
  }: {
    chats: Chat[];
    selectedChatId?: string;
    onChatSelect: (chat: Chat) => void;
    hasUnread: (chatId: string) => boolean;
    getUnreadCount: (chatId: string) => number;
    formatTime: (timestamp: any) => string;
  }) => {
    return (
      <>
        {chats.map((chat: Chat) => (
          <motion.div
            key={chat.id}
            onClick={() => {
              console.log(
                "Chat clicked:",
                chat.id,
                "selectedChatId:",
                selectedChatId
              );
              if (selectedChatId === chat.id) return;
              console.log("Calling onChatSelect");
              onChatSelect(chat);
            }}
            className={`p-4 border-b border-neutral-800 cursor-pointer hover:bg-neutral-800 transition-colors ${
              selectedChatId === chat.id ? "bg-neutral-800" : ""
            }`}
            whileHover={{ backgroundColor: "rgb(38 38 38)" }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                {chat.otherUser?.avatar ? (
                  <img
                    src={chat.otherUser.avatar}
                    alt={chat.otherUser.displayName || chat.otherUser.username}
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
                <div className="flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-semibold rounded-full flex-shrink-0">
                  {getUnreadCount(chat.id) > 99
                    ? "99+"
                    : getUnreadCount(chat.id)}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </>
    );
  }
);

export default function Messages() {
  const { user } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { markAsRead, hasUnread, getUnreadCount } = useUnreadMessages();

  // State
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [chatListLoading, setChatListLoading] = useState(true);
  const [chatWindowLoading, setChatWindowLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
    console.log(
      "Messages useEffect - selectedChat:",
      selectedChat?.id,
      "user:",
      user?.uid
    );
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
    console.log(
      "OtherUser useEffect - selectedChat:",
      selectedChat?.id,
      "user:",
      user?.uid
    );
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

  // Memoized filtered chats
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

  // Memoized chat selection handler
  const handleChatSelect = useCallback(
    (chat: Chat) => {
      console.log("handleChatSelect called with:", chat);
      setChatWindowLoading(true);
      setSelectedChat(chat);
      updateURL(chat);
    },
    [updateURL]
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

      // Less than 1 minute
      if (diffInMinutes < 1) return "now";

      // Less than 1 hour
      if (diffInMinutes < 60) {
        const minutes = Math.floor(diffInMinutes);
        return `${minutes}m`;
      }

      // Less than 24 hours
      if (diffInHours < 24) {
        const hours = Math.floor(diffInHours);
        return `${hours}h`;
      }

      // Less than 7 days
      if (diffInDays < 7) {
        const days = Math.floor(diffInDays);
        return `${days}d`;
      }

      // More than 7 days - show date
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "";
    }
  }, []);

  return (
    <PageWrapper className="h-screen bg-neutral-950 overflow-hidden">
      <div className="flex h-full">
        {/* Left Panel - Chat List */}
        <div className="w-1/3 bg-neutral-900 border-r border-neutral-800 flex flex-col min-w-0">
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-primary">Messages</h1>
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
                className="w-full bg-neutral-800 text-white px-10 py-2 rounded-lg border border-neutral-700 focus:border-primary outline-none"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {chatListLoading ? (
              // Chat List Loading Skeleton
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-neutral-700 rounded-full animate-pulse flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="w-24 h-4 bg-neutral-700 rounded mb-2 animate-pulse"></div>
                      <div className="w-32 h-3 bg-neutral-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                <p className="text-sm">No chats yet</p>
              </div>
            ) : (
              <ChatList
                chats={filteredChats}
                selectedChatId={selectedChat?.id}
                onChatSelect={handleChatSelect}
                hasUnread={hasUnread}
                getUnreadCount={getUnreadCount}
                formatTime={formatTime}
              />
            )}
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div className="flex-1 bg-neutral-950 flex flex-col min-w-0">
          <ChatWindow
            selectedChat={selectedChat}
            otherUser={otherUser}
            messages={messages}
            onNavigateToProfile={(userId) => navigate(`/user/${userId}`)}
            isLoading={chatWindowLoading}
          />
        </div>
      </div>
    </PageWrapper>
  );
}
