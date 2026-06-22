export type OrderStatus =
  | "Pending"
  | "Processing"
  | "In Progress"
  | "Completed"
  | "Cancelled"
  | "Partial"
  | "Refunded";

export interface Order {
  id: string;
  service_id: number;
  service_name: string;
  link: string;
  quantity: number;
  amount: number; // in Naira (kobo * 100)
  status: OrderStatus;
  start_count?: number;
  remains?: number;
  created_at: string;
  user_id: string;
}
