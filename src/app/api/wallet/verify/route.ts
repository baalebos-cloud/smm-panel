import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/api/paystack";
import { createClient } from "@/lib/supabase/server";

// GET /api/wallet/verify?reference=xxx — called after Paystack redirect
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  if (!reference) return NextResponse.json({ error: "Missing reference" }, { status: 400 });

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.redirect(new URL("/auth/login", req.url));

    const payment = await verifyPayment(reference);

    if (payment.status !== "success") {
      return NextResponse.redirect(new URL("/wallet?status=failed", req.url));
    }

    const amountNaira = payment.amount / 100;

    // Credit wallet
    const { data: profile } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user.id)
      .single();

    await supabase
      .from("profiles")
      .update({ wallet_balance: (profile?.wallet_balance ?? 0) + amountNaira })
      .eq("id", user.id);

    // Log transaction
    await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      type: "credit",
      amount: amountNaira,
      status: "success",
      method: "card",
      reference,
      description: "Wallet top-up via Paystack",
    });

    return NextResponse.redirect(new URL(`/wallet?status=success&amount=${amountNaira}`, req.url));
  } catch (err) {
    console.error("[GET /api/wallet/verify]", err);
    return NextResponse.redirect(new URL("/wallet?status=error", req.url));
  }
}
