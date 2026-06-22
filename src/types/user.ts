// src/types/user.ts
export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  username?: string;
  wallet_balance: number;
  role: "user" | "reseller" | "admin";
  created_at: string;
}
