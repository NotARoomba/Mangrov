export type AuthStageType = "email" | "basic" | "interests" | "verify";

export type Post = {
  id: string;
  caption: string;
  images: string[];
  keywords: string[];
  niche: string[];
  likes: string[];
  saves: boolean;
  businessId: string;
  comments: boolean;
  date: any;
  productIds: string[];
};
