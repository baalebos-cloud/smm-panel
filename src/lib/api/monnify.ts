// src/lib/api/monnify.ts
import axios from "axios";

const MONNIFY_BASE_URL = "https://api.monnify.com";
// Use sandbox for dev: https://sandbox.monnify.com

const getAccessToken = async (): Promise<string> => {
  const credentials = Buffer.from(
    `${process.env.MONNIFY_API_KEY}:${process.env.MONNIFY_SECRET_KEY}`
  ).toString("base64");

  const { data } = await axios.post(
    `${MONNIFY_BASE_URL}/api/v1/auth/login`,
    {},
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
    }
  );

  return data.responseBody.accessToken;
};

export interface InitializePaymentParams {
  amount: number;        // in Naira
  reference: string;
  email: string;
  fullName: string;
  description?: string;
}

export interface MonnifyPaymentResponse {
  checkoutUrl: string;
  transactionReference: string;
  paymentReference: string;
}

// Initialize a Monnify transaction
export const initializePayment = async (
  params: InitializePaymentParams
): Promise<MonnifyPaymentResponse> => {
  const token = await getAccessToken();

  const { data } = await axios.post(
    `${MONNIFY_BASE_URL}/api/v1/merchant/transactions/init-transaction`,
    {
      amount: params.amount,
      customerName: params.fullName,
      customerEmail: params.email,
      paymentReference: params.reference,
      paymentDescription: params.description ?? "Wallet Top-up",
      currencyCode: "NGN",
      contractCode: process.env.MONNIFY_CONTRACT_CODE,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/wallet/verify`,
      paymentMethods: ["CARD", "ACCOUNT_TRANSFER", "USSD", "PHONE_NUMBER"],
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return {
    checkoutUrl: data.responseBody.checkoutUrl,
    transactionReference: data.responseBody.transactionReference,
    paymentReference: data.responseBody.paymentReference,
  };
};

// Verify a completed transaction
export const verifyPayment = async (
  transactionReference: string
): Promise<{ status: string; amount: number; email: string }> => {
  const token = await getAccessToken();

  const encodedRef = encodeURIComponent(transactionReference);
  const { data } = await axios.get(
    `${MONNIFY_BASE_URL}/api/v2/transactions/${encodedRef}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const body = data.responseBody;

  return {
    status: body.paymentStatus,   // "PAID" | "PENDING" | "FAILED"
    amount: body.amountPaid,
    email: body.customer.email,
  };
};

// Generate a unique payment reference
export const generateReference = (userId: string): string =>
  `smm_${userId.slice(0, 8)}_${Date.now()}`;
