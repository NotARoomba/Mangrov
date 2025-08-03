import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import {
  onSnapshot,
  collection,
  query,
  where,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "./useAuth";

export type UnreadMessage = {
  chatId: string;
  count: number;
  lastMessageTime: Date;
  lastMessage: string;
  otherUserId: string;
  otherUserName: string;
};

type UnreadMessagesContextType = {
  unreadMessages: UnreadMessage[];
  totalUnread: number;
  markAsRead: (chatId: string) => void;
  markAllAsRead: () => void;
  hasUnread: (chatId: string) => boolean;
  getUnreadCount: (chatId: string) => number;
};

const UnreadMessagesContext = createContext<UnreadMessagesContextType | null>(
  null
);

export const UnreadMessagesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState<UnreadMessage[]>([]);

  useEffect(() => {
    if (!user) {
      setUnreadMessages([]);
      return;
    }

    // Listen to messages where the current user is not the sender
    const messagesQuery = query(
      collection(db, "messages"),
      where("senderId", "!=", user.uid),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const unreadMap = new Map<string, UnreadMessage>();

      snapshot.docs.forEach((doc) => {
        const messageData = doc.data();

        // Skip system messages
        if (messageData.isSystemMessage) {
          return;
        }

        const chatId = messageData.chatId;

        if (!unreadMap.has(chatId)) {
          unreadMap.set(chatId, {
            chatId,
            count: 0,
            lastMessageTime: messageData.timestamp?.toDate() || new Date(),
            lastMessage: messageData.text || "",
            otherUserId: messageData.senderId,
            otherUserName: messageData.senderName || "Unknown User",
          });
        }

        const existing = unreadMap.get(chatId)!;
        existing.count += 1;

        // Update with the most recent message
        if (messageData.timestamp?.toDate() > existing.lastMessageTime) {
          existing.lastMessageTime = messageData.timestamp.toDate();
          existing.lastMessage = messageData.text || "";
        }
      });

      setUnreadMessages(Array.from(unreadMap.values()));
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = (chatId: string) => {
    setUnreadMessages((prev) => prev.filter((msg) => msg.chatId !== chatId));
  };

  const markAllAsRead = () => {
    setUnreadMessages([]);
  };

  const hasUnread = (chatId: string) => {
    return unreadMessages.some((msg) => msg.chatId === chatId);
  };

  const getUnreadCount = (chatId: string) => {
    const unread = unreadMessages.find((msg) => msg.chatId === chatId);
    return unread ? unread.count : 0;
  };

  const totalUnread = useMemo(
    () => unreadMessages.reduce((sum, msg) => sum + msg.count, 0),
    [unreadMessages]
  );

  return (
    <UnreadMessagesContext.Provider
      value={{
        unreadMessages,
        totalUnread,
        markAsRead,
        markAllAsRead,
        hasUnread,
        getUnreadCount,
      }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
};

export const useUnreadMessages = () => {
  const context = useContext(UnreadMessagesContext);
  if (!context) {
    throw new Error(
      "useUnreadMessages must be used within UnreadMessagesProvider"
    );
  }
  return context;
};
