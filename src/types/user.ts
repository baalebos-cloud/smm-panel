// src/types/wallet.ts
export type TransactionType = "credit" | "debit";
export type TransactionStatus = "success" | "pending" | "failed";
export type PaymentMethod = "card" | "transfer" | "opay" | "crypto";

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  method?: PaymentMethod;
  reference?: string;
  description: string;
  created_at: string;
}

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
