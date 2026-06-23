import type { SMMProvider, SMMOrderParams, SMMOrderResponse, SMMOrderStatus, SMMService, SMMBalance } from "./types";
import { createPeakerrProvider } from "./providers/peakerr";
import { createJAPProvider } from "./providers/jap";

export type { SMMProvider, SMMOrderParams, SMMOrderResponse, SMMOrderStatus, SMMService, SMMBalance };

export type ProviderName = "peakerr" | "jap";

// Get provider based on environment config or explicit name
export const getSMMProvider = (providerName?: ProviderName): SMMProvider => {
  const name = providerName || (process.env.SMM_PROVIDER as ProviderName) || "peakerr";

  switch (name) {
    case "jap":
      return createJAPProvider();
    case "peakerr":
    default:
      return createPeakerrProvider();
  }
};

// Convenience functions using default provider
export async function placeProviderOrder(params: SMMOrderParams): Promise<SMMOrderResponse> {
  const provider = getSMMProvider();
  return provider.createOrder(params);
}

export async function getProviderOrderStatus(orderId: number): Promise<SMMOrderStatus> {
  const provider = getSMMProvider();
  return provider.getOrderStatus(orderId);
}

export async function getProviderServices(): Promise<SMMService[]> {
  const provider = getSMMProvider();
  return provider.getServices();
}

export async function getProviderBalance(): Promise<SMMBalance> {
  const provider = getSMMProvider();
  return provider.getBalance();
}
