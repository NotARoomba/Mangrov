export type AuthStageType = "email" | "basic" | "interests" | "verify";

export type Post = {
  id: string;
  title: string;
  images: string[];
  description: string;
  keywords: string[];
  niche: string[];
  likes: boolean;
  saves: boolean;
  business: string;
  comments: boolean;
  timestamp: any;
  url: string;
  productIds: string[];
  uid?: string;
  isAvailable?: boolean;
  price?: number;
  views?: number;
};

export type User = {
  uid: string;
  username: string;
  displayName: string;
  avatar?: string;
  interests?: string[];
  bio?: string;
  email?: string;
  country?: string;
  language?: string;
};

export type Message = {
  id: string;
  text: string;
  imageUrl?: string;
  senderId: string;
  receiverId: string;
  timestamp: any;
  read: boolean;
  isSystemMessage?: boolean;
};

export type Chat = {
  id: string;
  participants: string[];
  lastMessage?: Message;
  lastMessageTime?: any;
  unreadCount: number;
  otherUser?: User;
  isTradeMatch?: boolean;
};
