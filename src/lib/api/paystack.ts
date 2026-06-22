import axios from "axios";

const paystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

export interface InitializePaymentParams {
  email: string;
  amount: number; // in kobo (Naira * 100)
  reference: string;
  metadata?: Record<string, unknown>;
  callback_url?: string;
}

// Initialize a Paystack transaction
export async function initializePayment(params: InitializePaymentParams) {
  const { data } = await paystack.post("/transaction/initialize", params);
  return data.data as { authorization_url: string; access_code: string; reference: string };
}

// Verify a Paystack transaction by reference
export async function verifyPayment(reference: string) {
  const { data } = await paystack.get(`/transaction/verify/${reference}`);
  return data.data as {
    status: string;
    amount: number;
    customer: { email: string };
    metadata: Record<string, unknown>;
  };
}

// Generate a unique payment reference
export const generateReference = (userId: string) =>
  `smm_${userId.slice(0, 8)}_${Date.now()}`;
