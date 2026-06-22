"use client";
import { useAppStore } from "@/store/useAppStore";
import { fmt } from "@/lib/utils";

export function useWallet() {
  const { user, updateBalance } = useAppStore();

  const balance = user?.wallet_balance ?? 0;
  const formattedBalance = fmt(balance);

  const canAfford = (amount: number) => balance >= amount;

  const debit = (amount: number) => updateBalance(-amount);
  const credit = (amount: number) => updateBalance(amount);

  return { balance, formattedBalance, canAfford, debit, credit };
}
