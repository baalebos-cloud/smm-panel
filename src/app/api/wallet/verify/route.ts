import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPayment } from "@/lib/api/strowallet";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");

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
      .select("id, status, user_id")
      .eq("reference", reference)
      .single();

    if (existingTx && existingTx.status === "success") {
      return NextResponse.redirect(
        new URL(`/wallet?status=success&already_processed=true`, req.url)
      );
    }

    // Verify payment with Strowallet
    const payment = await verifyPayment(reference);

    console.log("Payment verification result:", payment);

    // Check if payment is successful
    const isSuccess = payment.status.toLowerCase() === "paid" || 
                      payment.status.toLowerCase() === "successful" ||
                      payment.status.toLowerCase() === "success";

    if (!isSuccess) {
      return NextResponse.redirect(new URL(`/wallet?status=failed&reason=${payment.status}`, req.url));
    }

    // Determine user ID (from existing tx or current user)
    const userId = existingTx?.user_id || user.id;

    // Credit wallet atomically
    const { error: creditError } = await adminClient.rpc("credit_wallet_balance", {
      p_user_id: userId,
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
        user_id: userId,
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
