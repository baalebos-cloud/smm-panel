import "server-only";
import axios from "axios";

const STROWALLET_CHECKOUT_URL = "https://strowallet.com/pay/";
const STROWALLET_STATUS_URL = "https://strowallet.com/api/checkout/status/";

export interface InitializePaymentParams {
  amount: number;
  email: string;
  name: string;
  reference: string;
}

export const initializePayment = async (
  params: InitializePaymentParams
): Promise<{ checkoutUrl: string; reference: string }> => {
  const publicKey = process.env.STROWALLET_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error("STROWALLET_PUBLIC_KEY not configured");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  try {
    const { data } = await axios.post(STROWALLET_CHECKOUT_URL, null, {
      params: {
        public_key: publicKey,
        amount: params.amount,
        currency: "NGN",
        description: "SMMPanel Wallet Top-up",
        customer_name: params.name,
        customer_email: params.email,
        callback_url: `${appUrl}/api/wallet/webhook`,
        success_url: `${appUrl}/api/wallet/verify?reference=${params.reference}`,
        cancel_url: `${appUrl}/wallet?status=cancelled`,
      },
      headers: {
        Accept: "application/json",
      },
    });

    console.log("Strowallet init response:", data);

    if (data.status === true) {
      return {
        checkoutUrl: data.data.checkout_url,
        reference: data.data.reference,
      };
    }

    throw new Error(data.message || "Failed to initialize payment");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Strowallet API Error:", {
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(
        error.response?.data?.message ?? `API Error: ${error.response?.status}`
      );
    }
    throw error;
  }
};

export const verifyPayment = async (
  reference: string
): Promise<{ status: string; amount: number }> => {
  const publicKey = process.env.STROWALLET_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error("STROWALLET_PUBLIC_KEY not configured");
  }

  try {
    const { data } = await axios.get(STROWALLET_STATUS_URL, {
      params: {
        public_key: publicKey,
        reference,
      },
      headers: {
        Accept: "application/json",
      },
    });

    console.log("Strowallet verify response:", data);

    if (data.status === true) {
      return {
        status: data.data.payment_status,
        amount: Number(data.data.amount),
      };
    }

    throw new Error(data.message || "Failed to fetch payment status");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Strowallet Verify Error:", {
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(
        error.response?.data?.message ?? `Verify Error: ${error.response?.status}`
      );
    }
    throw error;
  }
};

// Generate unique reference
export const generateReference = (userId: string): string =>
  `SMM_${userId.slice(0, 8)}_${Date.now()}`;
