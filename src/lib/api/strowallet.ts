import "server-only";
import axios from "axios";

const STROWALLET_BASE_URL = "https://strowallet.com/api";

const API_KEY = process.env.STROWALLET_API_KEY!;
const API_TOKEN = process.env.STROWALLET_API_TOKEN!;

export interface InitializePaymentParams {
  amount: number;
  email: string;
  name: string;
  phone?: string;
  reference: string;
}

export interface StrowalletPaymentResponse {
  status: boolean;
  message: string;
  data: {
    link: string;
    reference: string;
  };
}

export interface StrowalletVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    amount: number;
    reference: string;
  };
}

// Initialize payment
export const initializePayment = async (
  params: InitializePaymentParams
): Promise<{ checkoutUrl: string; reference: string }> => {
  const { data } = await axios.post<StrowalletPaymentResponse>(
    `${STROWALLET_BASE_URL}/payment/initiate`,
    {
      api_key: API_KEY,
      api_token: API_TOKEN,
      amount: params.amount,
      email: params.email,
      name: params.name,
      phone: params.phone || "",
      reference: params.reference,
      currency: "NGN",
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/wallet/verify`,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!data.status) {
    throw new Error(data.message || "Failed to initialize payment");
  }

  return {
    checkoutUrl: data.data.link,
    reference: data.data.reference,
  };
};

// Verify payment
export const verifyPayment = async (
  reference: string
): Promise<{ status: string; amount: number }> => {
  const { data } = await axios.post<StrowalletVerifyResponse>(
    `${STROWALLET_BASE_URL}/payment/verify`,
    {
      api_key: API_KEY,
      api_token: API_TOKEN,
      reference,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!data.status) {
    throw new Error(data.message || "Failed to verify payment");
  }

  return {
    status: data.data.status,
    amount: data.data.amount,
  };
};

// Generate unique reference
export const generateReference = (userId: string): string =>
  `smm_${userId.slice(0, 8)}_${Date.now()}`;
