import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPayment } from "@/lib/api/strowallet";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Strowallet webhook received:", body);

    const reference = body.reference || body.data?.reference;

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Check if already processed
    const { data: existingTx } = await adminClient
      .from("wallet_transactions")
      .select("id, status, user_id")
      .eq("reference", reference)
      .single();

    if (existingTx && existingTx.status === "success") {
      return NextResponse.json({ message: "Already processed" });
    }

    // Verify payment with Strowallet
    const payment = await verifyPayment(reference);

    const isSuccess = payment.status.toLowerCase() === "paid" || 
                      payment.status.toLowerCase() === "successful" ||
                      payment.status.toLowerCase() === "success";

    if (!isSuccess) {
      console.log("Payment not successful:", payment.status);
      return NextResponse.json({ message: "Payment not successful", status: payment.status });
    }

    if (!existingTx) {
      console.log("No pending transaction found for reference:", reference);
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Credit wallet
    const { error: creditError } = await adminClient.rpc("credit_wallet_balance", {
      p_user_id: existingTx.user_id,
      p_amount: payment.amount,
    });

    if (creditError) {
      console.error("Webhook credit error:", creditError);
      return NextResponse.json({ error: "Failed to credit wallet" }, { status: 500 });
    }

    // Update transaction status
    await adminClient
      .from("wallet_transactions")
      .update({
        status: "success",
        description: "Wallet top-up via Strowallet",
      })
      .eq("id", existingTx.id);

    return NextResponse.json({ message: "Payment processed successfully" });
  } catch (err) {
    console.error("[POST /api/wallet/webhook]", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

// Also handle GET requests (some gateways use GET for callbacks)
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  
  if (reference) {
    // Redirect to verify endpoint
    return NextResponse.redirect(new URL(`/api/wallet/verify?reference=${reference}`, req.url));
  }
  
  return NextResponse.json({ error: "Missing reference" }, { status: 400 });
}
