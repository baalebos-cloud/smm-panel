import "server-only";
import axios from "axios";

const provider = axios.create({
  baseURL: process.env.SMM_PROVIDER_URL,
  timeout: 30000,
});

const KEY = process.env.SMM_PROVIDER_API_KEY!;

export interface SMMOrder {
  service: number;
  link: string;
  quantity: number;
}

export interface SMMOrderResponse {
  order: number; // provider order ID
}

export interface SMMOrderStatus {
  charge: string;
  start_count: string;
  status: string;
  remains: string;
  currency: string;
}

// Place a new order with the wholesale SMM provider
export async function placeProviderOrder(
  order: SMMOrder
): Promise<SMMOrderResponse> {
  const { data } = await provider.post("", {
    key: KEY,
    action: "add",
    service: order.service,
    link: order.link,
    quantity: order.quantity,
  });
  if (data.error) throw new Error(data.error);
  return data;
}

// Check status of an existing order
export async function getProviderOrderStatus(
  orderId: number
): Promise<SMMOrderStatus> {
  const { data } = await provider.post("", {
    key: KEY,
    action: "status",
    order: orderId,
  });
  if (data.error) throw new Error(data.error);
  return data;
}

// Fetch all services from provider (for syncing)
export async function getProviderServices() {
  const { data } = await provider.post("", {
    key: KEY,
    action: "services",
  });
  return data;
}
