"use client";
import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import type { Order } from "@/types/order";

export function useOrders() {
  const { orders, setOrders, addOrder } = useAppStore();
  const supabase = createClient();

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setOrders(data as Order[]);
  }, [supabase, setOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const placeOrder = async (
    serviceId: number,
    serviceName: string,
    link: string,
    quantity: number,
    amount: number
  ): Promise<Order> => {
    const { data, error } = await supabase
      .from("orders")
      .insert({
        service_id: serviceId,
        service_name: serviceName,
        link,
        quantity,
        amount,
        status: "Pending",
      })
      .select()
      .single();

    if (error) throw error;
    addOrder(data as Order);
    return data as Order;
  };

  return { orders, fetchOrders, placeOrder };
}
