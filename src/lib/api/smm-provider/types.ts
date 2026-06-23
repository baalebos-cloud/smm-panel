export interface SMMService {
  service: number;
  name: string;
  type: string;
  rate: string;
  min: string;
  max: string;
  category: string;
  refill: boolean;
  cancel: boolean;
}

export interface SMMOrderParams {
  service: number;
  link: string;
  quantity: number;
}

export interface SMMOrderResponse {
  order: number;
}

export interface SMMOrderStatus {
  charge: string;
  start_count: string;
  status: string;
  remains: string;
  currency: string;
}

export interface SMMBalance {
  balance: string;
  currency: string;
}

export interface SMMProvider {
  name: string;
  getServices(): Promise<SMMService[]>;
  createOrder(params: SMMOrderParams): Promise<SMMOrderResponse>;
  getOrderStatus(orderId: number): Promise<SMMOrderStatus>;
  getBalance(): Promise<SMMBalance>;
}
