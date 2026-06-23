import axios, { AxiosInstance } from "axios";
import type { 
  SMMProvider, 
  SMMService, 
  SMMOrderParams, 
  SMMOrderResponse, 
  SMMOrderStatus,
  SMMBalance 
} from "./types";

export class BaseAPIProvider implements SMMProvider {
  name: string;
  protected client: AxiosInstance;
  protected apiKey: string;

  constructor(name: string, baseURL: string, apiKey: string) {
    this.name = name;
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async getServices(): Promise<SMMService[]> {
    const { data } = await this.client.post("", {
      key: this.apiKey,
      action: "services",
    });

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  }

  async createOrder(params: SMMOrderParams): Promise<SMMOrderResponse> {
    const { data } = await this.client.post("", {
      key: this.apiKey,
      action: "add",
      service: params.service,
      link: params.link,
      quantity: params.quantity,
    });

    if (data.error) {
      throw new Error(data.error);
    }

    return { order: data.order };
  }

  async getOrderStatus(orderId: number): Promise<SMMOrderStatus> {
    const { data } = await this.client.post("", {
      key: this.apiKey,
      action: "status",
      order: orderId,
    });

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  }

  async getBalance(): Promise<SMMBalance> {
    const { data } = await this.client.post("", {
      key: this.apiKey,
      action: "balance",
    });

    if (data.error) {
      throw new Error(data.error);
    }

    return {
      balance: data.balance,
      currency: data.currency || "USD",
    };
  }
}
