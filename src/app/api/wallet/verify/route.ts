import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER || "monnify";

const getPaymentModule = async () => {
  if (PAYMENT_PROVIDER === "strowallet") {
    return await import("@/lib/api/strowallet");
  }
  return await import("@/lib/api/monnify");
};

export async function GET(req: NextRequest) {
  // Support both Monnify and Strowallet callback params
  const transactionReference = 
    req.nextUrl.searchParams.get("transactionReference") || 
    req.nextUrl.searchParams.get("reference") ||
    req.nextUrl.searchParams.get("tx_ref");

  if (!transactionReference) {
    return NextResponse.redirect(new URL("/wallet?status=failed&reason=missing_reference", req.url));
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const adminClient = createAdminClient();

    // Idempotency check
    const { data: existingTx } = await adminClient
      .from("wallet_transactions")
      .select("id, status")
      .eq("reference", transactionReference)
      .single();

    if (existingTx && existingTx.status === "success") {
      return NextResponse.redirect(
        new URL(`/wallet?status=success&already_processed=true`, req.url)
      );
    }

    // Verify payment with provider
    const paymentModule = await getPaymentModule();
    const payment = await paymentModule.verifyPayment(transactionReference);

    // Check if payment is successful
    const isSuccess = 
      payment.status === "PAID" || 
      payment.status === "successful" || 
      payment.status === "success";

    if (!isSuccess) {
      return NextResponse.redirect(new URL("/wallet?status=failed&reason=not_paid", req.url));
    }

    // Credit wallet atomically
    const { error: creditError } = await adminClient.rpc("credit_wallet_balance", {
      p_user_id: user.id,
      p_amount: payment.amount,
    });

    if (creditError) {
      console.error("[GET /api/wallet/verify] Credit error:", creditError);
      return NextResponse.redirect(new URL("/wallet?status=error&reason=credit_failed", req.url));
    }

    // Update or insert transaction record
    if (existingTx) {
      await adminClient
        .from("wallet_transactions")
        .update({
          status: "success",
          description: `Wallet top-up via ${PAYMENT_PROVIDER}`,
        })
        .eq("id", existingTx.id);
    } else {
      await adminClient.from("wallet_transactions").insert({
        user_id: user.id,
        type: "credit",
        amount: payment.amount,
        status: "success",
        method: "transfer",
        reference: transactionReference,
        description: `Wallet top-up via ${PAYMENT_PROVIDER}`,
      });
    }

    return NextResponse.redirect(
      new URL(`/wallet?status=success&amount=${payment.amount}`, req.url)
    );
  } catch (err) {
    console.error("[GET /api/wallet/verify]", err);
    return NextResponse.redirect(new URL("/wallet?status=error", req.url));
  }
}
