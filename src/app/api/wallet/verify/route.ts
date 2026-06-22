import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/api/monnify";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const transactionReference = req.nextUrl.searchParams.get("transactionReference");

  if (!transactionReference) {
    return NextResponse.redirect(new URL("/wallet?status=failed&reason=missing_reference", req.url));
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Use admin client to bypass RLS
    const adminClient = createAdminClient();

    // Idempotency check - prevent double processing
    const { data: existingTx } = await adminClient
      .from("wallet_transactions")
      .select("id, status")
      .eq("reference", transactionReference)
      .single();

    if (existingTx && existingTx.status === "success") {
      // Already processed - redirect to success without re-crediting
      return NextResponse.redirect(
        new URL(`/wallet?status=success&already_processed=true`, req.url)
      );
    }

    const payment = await verifyPayment(transactionReference);

    if (payment.status !== "PAID") {
      return NextResponse.redirect(new URL("/wallet?status=failed&reason=not_paid", req.url));
    }

    // Atomically credit wallet (prevents race conditions)
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
      // Update existing pending transaction
      await adminClient
        .from("wallet_transactions")
        .update({
          status: "success",
          description: "Wallet top-up via Monnify",
        })
        .eq("id", existingTx.id);
    } else {
      // Insert new transaction record
      await adminClient.from("wallet_transactions").insert({
        user_id: user.id,
        type: "credit",
        amount: payment.amount,
        status: "success",
        method: "transfer",
        reference: transactionReference,
        description: "Wallet top-up via Monnify",
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
