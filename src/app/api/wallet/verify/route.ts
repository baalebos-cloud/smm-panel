import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPayment } from "@/lib/api/strowallet";

export async function GET(req: NextRequest) {
  // Strowallet uses "reference" or "tx_ref" as callback param
  const reference = 
    req.nextUrl.searchParams.get("reference") || 
    req.nextUrl.searchParams.get("tx_ref") ||
    req.nextUrl.searchParams.get("transactionReference");

  if (!reference) {
    return NextResponse.redirect(new URL("/wallet?status=failed&reason=missing_reference", req.url));
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const adminClient = createAdminClient();

    // Idempotency check - prevent double processing
    const { data: existingTx } = await adminClient
      .from("wallet_transactions")
      .select("id, status")
      .eq("reference", reference)
      .single();

    if (existingTx && existingTx.status === "success") {
      return NextResponse.redirect(
        new URL(`/wallet?status=success&already_processed=true`, req.url)
      );
    }

    // Verify payment with Strowallet
    const payment = await verifyPayment(reference);

    // Check if payment is successful
    const isSuccess = 
      payment.status.toLowerCase() === "successful" || 
      payment.status.toLowerCase() === "success" ||
      payment.status.toLowerCase() === "paid";

    if (!isSuccess) {
      return NextResponse.redirect(new URL(`/wallet?status=failed&reason=${payment.status}`, req.url));
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
          description: "Wallet top-up via Strowallet",
        })
        .eq("id", existingTx.id);
    } else {
      await adminClient.from("wallet_transactions").insert({
        user_id: user.id,
        type: "credit",
        amount: payment.amount,
        status: "success",
        method: "transfer",
        reference: reference,
        description: "Wallet top-up via Strowallet",
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
