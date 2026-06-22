// src/types/service.ts
export type Platform =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "twitter"
  | "facebook"
  | "spotify";

export interface Service {
  id: number;
  platform: Platform;
  category: string;
  name: string;
  rate: number; // per 1,000 units in Naira
  min: number;
  max: number;
  delivery: string;
  refill: boolean;
  popular: boolean;
  description?: string;
}

export interface PlatformMeta {
  id: Platform;
  label: string;
  icon: string;
  color: string;
}
