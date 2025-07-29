import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../utils/firebase";
import { useAuth } from "../hooks/useAuth";
import { useParams, useNavigate } from "react-router";
import PageWrapper from "../components/PageWrapper";
import {
  Send,
  Image as ImageIcon,
  MoreVertical,
  Video,
  Phone,
  Info,
  Search,
  ArrowLeft,
} from "lucide-react";
import type { User } from "../utils/types";

interface Message {
  id: string;
  text: string;
  imageUrl?: string;
  senderId: string;
  receiverId: string;
  timestamp: any;
  read: boolean;
}

interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  lastMessageTime?: any;
  unreadCount: number;
  otherUser?: User;
}

export default function Messages() {
  const { user } = useAuth();
  const { userId } = useParams();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      for (const snapDoc of snapshot.docs) {
        const chatData = snapDoc.data() as Chat;
        chatData.id = snapDoc.id;

        // Get other user's info
        const otherUserId = chatData.participants.find((id) => id !== user.uid);
        if (otherUserId) {
          try {
            const userDocSnap = await getDoc(doc(db, "users", otherUserId));
            if (userDocSnap.exists()) {
              chatData.otherUser = userDocSnap.data() as User;
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        }

        chatsData.push(chatData);
      }

      setChats(chatsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Handle dynamic user route
  useEffect(() => {
    if (userId && user && chats.length > 0) {
      const existingChat = chats.find((chat) =>
        chat.participants.includes(userId)
      );

      if (existingChat) {
        setSelectedChat(existingChat);
      } else {
        // Create new chat if it doesn't exist
        createNewChat(userId);
      }
    }
  }, [userId, user, chats]);

  const createNewChat = async (otherUserId: string) => {
    if (!user) return;

    try {
      const chatRef = await addDoc(collection(db, "chats"), {
        participants: [user.uid, otherUserId],
        lastMessageTime: serverTimestamp(),
        unreadCount: 0,
      });

      const newChat: Chat = {
        id: chatRef.id,
        participants: [user.uid, otherUserId],
        lastMessageTime: serverTimestamp(),
        unreadCount: 0,
      };

      setSelectedChat(newChat);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

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
    });

    return () => unsubscribe();
  }, [selectedChat, user]);

  // Get other user info when chat is selected
  useEffect(() => {
    if (!selectedChat || !user) return;

    const otherUserId = selectedChat.participants.find((id) => id !== user.uid);
    if (otherUserId) {
      getDoc(doc(db, "users", otherUserId)).then((userDoc) => {
        if (userDoc.exists()) {
          setOtherUser(userDoc.data() as User);
        }
      });
    }
  }, [selectedChat, user]);

  const sendMessage = async (text: string, imageUrl?: string) => {
    if (!selectedChat || !user || (!text.trim() && !imageUrl)) return;

    try {
      await addDoc(collection(db, "messages"), {
        chatId: selectedChat.id,
        text: text.trim(),
        imageUrl,
        senderId: user.uid,
        receiverId: selectedChat.participants.find((id) => id !== user.uid),
        timestamp: serverTimestamp(),
        read: false,
      });

      // Update chat's last message
      await addDoc(collection(db, "chats"), {
        ...selectedChat,
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

  const filteredChats = chats.filter(
    (chat) =>
      chat.otherUser?.displayName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      chat.otherUser?.username
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return "now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  if (loading) {
    return (
      <PageWrapper className="min-h-screen bg-neutral-950">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">Loading messages...</div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="min-h-screen bg-neutral-950">
      <div className="flex h-screen">
        {/* Left Panel - Chat List */}
        <div className="w-1/3 bg-neutral-900 border-r border-neutral-800 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-neutral-800">
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
          <div className="flex-1 overflow-y-auto">
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                  <Search size={32} />
                </div>
                <p>No messages yet</p>
                <p className="text-sm mb-4">
                  Start a conversation to see messages here
                </p>
                <button
                  onClick={() => navigate("/trade")}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/80 transition-colors"
                >
                  Trade with someone to start messaging
                </button>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <motion.div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 border-b border-neutral-800 cursor-pointer hover:bg-neutral-800 transition-colors ${
                    selectedChat?.id === chat.id ? "bg-neutral-800" : ""
                  }`}
                  whileHover={{ backgroundColor: "rgb(38 38 38)" }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {chat.otherUser?.displayName?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold truncate">
                          {chat.otherUser?.displayName || "Unknown User"}
                        </h3>
                        {chat.lastMessageTime && (
                          <span className="text-xs text-neutral-400">
                            {formatTime(chat.lastMessageTime)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-400 truncate">
                        {chat.lastMessage?.text || "No messages yet"}
                      </p>
                    </div>
                    {chat.unreadCount > 0 && (
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div className="flex-1 bg-neutral-950 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-neutral-800 bg-neutral-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="md:hidden text-neutral-400 hover:text-white"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {otherUser?.displayName?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-white font-semibold">
                        {otherUser?.displayName || "Unknown User"}
                      </h2>
                      <p className="text-sm text-neutral-400">
                        @{otherUser?.username || "unknown"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-neutral-400 hover:text-white p-2">
                      <Video size={20} />
                    </button>
                    <button className="text-neutral-400 hover:text-white p-2">
                      <Phone size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                    <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                      <Search size={32} />
                    </div>
                    <p>No messages yet</p>
                    <p className="text-sm mb-4">
                      Start a conversation with{" "}
                      {otherUser?.displayName || "this user"}
                    </p>
                    <button
                      onClick={() => navigate("/trade")}
                      className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/80 transition-colors"
                    >
                      Trade with someone to start messaging
                    </button>
                  </div>
                ) : (
                  messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        message.senderId === user?.uid
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.senderId === user?.uid
                            ? "bg-primary text-white"
                            : "bg-neutral-800 text-white"
                        }`}
                      >
                        {message.imageUrl && (
                          <img
                            src={message.imageUrl}
                            alt="Message"
                            className="w-full h-48 object-cover rounded-lg mb-2"
                          />
                        )}
                        {message.text && (
                          <p className="break-words">{message.text}</p>
                        )}
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp?.toDate().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-neutral-800 bg-neutral-900">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && sendMessage(newMessage)
                    }
                    placeholder="Message..."
                    className="flex-1 bg-neutral-800 text-white px-4 py-2 rounded-full border border-neutral-700 focus:border-primary outline-none"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleImageUpload(e.target.files[0])
                    }
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-neutral-400 hover:text-white p-2"
                  >
                    <ImageIcon size={20} />
                  </button>
                  <button
                    onClick={() => sendMessage(newMessage)}
                    disabled={!newMessage.trim()}
                    className="bg-primary text-white p-2 rounded-full hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center mb-6">
                <Search size={48} className="text-neutral-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Your messages
              </h2>
              <p className="text-neutral-400 mb-6">
                Send a message to start a chat
              </p>
              <button
                onClick={() => navigate("/trade")}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/80 transition-colors"
              >
                Trade with someone to start messaging
              </button>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
