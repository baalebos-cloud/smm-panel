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
