export type AuthStageType = "email" | "basic" | "interests" | "verify";

export type Post = {
  id: string;
  caption: string;
  images: string[];
  description: string;
  keywords: string[];
  niche: string[];
  likes: boolean;
  saves: boolean;
  business: string;
  comments: boolean;
  date: any;
  url: string;
  productIds: string[];
};
