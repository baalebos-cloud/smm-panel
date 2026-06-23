import "server-only";
import axios from "axios";

const STROWALLET_BASE_URL = "https://strowallet.com/api";

export interface InitializePaymentParams {
  amount: number;
  email: string;
  name: string;
  phone?: string;
  reference: string;
}

// Initialize payment
export const initializePayment = async (
  params: InitializePaymentParams
): Promise<{ checkoutUrl: string; reference: string }> => {
  const apiKey = process.env.STROWALLET_API_KEY;
  const apiToken = process.env.STROWALLET_API_TOKEN;

  if (!apiKey || !apiToken) {
    throw new Error("Strowallet credentials not configured");
  }

  const { data } = await axios.post(
    `${STROWALLET_BASE_URL}/payment/initiate`,
    {
      api_key: apiKey,
      api_token: apiToken,
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
    reference: data.data.reference || params.reference,
  };
};

// Verify payment
export const verifyPayment = async (
  reference: string
): Promise<{ status: string; amount: number }> => {
  const apiKey = process.env.STROWALLET_API_KEY;
  const apiToken = process.env.STROWALLET_API_TOKEN;

  if (!apiKey || !apiToken) {
    throw new Error("Strowallet credentials not configured");
  }

  const { data } = await axios.post(
    `${STROWALLET_BASE_URL}/payment/verify`,
    {
      api_key: apiKey,
      api_token: apiToken,
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
    amount: Number(data.data.amount),
  };
};

// Generate unique reference
export const generateReference = (userId: string): string =>
  `smm_${userId.slice(0, 8)}_${Date.now()}`;
