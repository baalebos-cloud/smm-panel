import { create } from "zustand";
import type { Order } from "@/types/order";
import type { AppUser } from "@/types/user";

interface AppState {
  user: AppUser | null;
  orders: Order[];
  sidebarOpen: boolean;

  setUser: (user: AppUser | null) => void;
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  updateBalance: (amount: number) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  orders: [],
  sidebarOpen: true,

  setUser: (user) => set({ user }),
  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
  updateOrderStatus: (id, status) =>
    set((s) => ({
      orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    })),
  updateBalance: (amount) =>
    set((s) => ({
      user: s.user ? { ...s.user, wallet_balance: s.user.wallet_balance + amount } : null,
    })),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
