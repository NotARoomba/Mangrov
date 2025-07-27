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
};
