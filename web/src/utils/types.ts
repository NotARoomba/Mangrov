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
};

export type User = {
  uid: string;
  username: string;
  displayName: string;
  avatar?: string;
  interests?: string[];
  bio?: string;
  email?: string;
};
