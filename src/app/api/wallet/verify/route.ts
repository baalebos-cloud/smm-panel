// src/app/api/wallet/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/api/monnify";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const transactionReference = req.nextUrl.searchParams.get("transactionReference");

  if (!transactionReference) {
    return NextResponse.redirect(new URL("/wallet?status=failed", req.url));
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const payment = await verifyPayment(transactionReference);

    if (payment.status !== "PAID") {
      return NextResponse.redirect(new URL("/wallet?status=failed", req.url));
    }

    // Credit wallet
    const { data: profile } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user.id)
      .single();

    await supabase
      .from("profiles")
      .update({ wallet_balance: (profile?.wallet_balance ?? 0) + payment.amount })
      .eq("id", user.id);

    // Log transaction
    await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      type: "credit",
      amount: payment.amount,
      status: "success",
      method: "transfer",
      reference: transactionReference,
      description: "Wallet top-up via Monnify",
    });

    return NextResponse.redirect(
      new URL(`/wallet?status=success&amount=${payment.amount}`, req.url)
    );
  } catch (err) {
    console.error("[GET /api/wallet/verify]", err);
    return NextResponse.redirect(new URL("/wallet?status=error", req.url));
  }
}
