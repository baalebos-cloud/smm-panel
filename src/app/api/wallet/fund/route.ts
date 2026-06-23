import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";

// Choose your payment provider
const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER || "monnify"; // "monnify" or "strowallet"

// Dynamic import based on provider
const getPaymentModule = async () => {
  if (PAYMENT_PROVIDER === "strowallet") {
    return await import("@/lib/api/strowallet");
  }
  return await import("@/lib/api/monnify");
};

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = rateLimit(req, 5, 60000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in again." }, { status: 401 });
    }

    const body = await req.json();
    const { amount } = body as { amount: number };

    // Validate amount
    if (!amount || typeof amount !== "number") {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (amount < 500) {
      return NextResponse.json({ error: "Minimum amount is ₦500" }, { status: 400 });
    }

    if (amount > 1000000) {
      return NextResponse.json({ error: "Maximum amount is ₦1,000,000" }, { status: 400 });
    }

    // Use admin client to bypass RLS
    const adminClient = createAdminClient();

    // Get user profile
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    let userProfile = profile;

    // If profile doesn't exist, create it
    if (profileError || !profile) {
      console.log("Profile not found, creating one for user:", user.id);
      
      const { data: newProfile, error: createError } = await adminClient
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          wallet_balance: 0,
          role: "user",
        })
        .select("full_name, email")
        .single();

      if (createError) {
        console.error("Failed to create profile:", createError);
        return NextResponse.json({ error: "Failed to create user profile. Please contact support." }, { status: 500 });
      }

      userProfile = newProfile;
    }

    if (!userProfile) {
      return NextResponse.json({ error: "Failed to retrieve profile" }, { status: 500 });
    }

    // Get payment module
    const paymentModule = await getPaymentModule();
    const reference = paymentModule.generateReference(user.id);

    try {
      let payment;

      if (PAYMENT_PROVIDER === "strowallet") {
        // Strowallet payment
        payment = await (paymentModule as typeof import("@/lib/api/strowallet")).initializePayment({
          amount,
          email: userProfile.email || user.email!,
          name: userProfile.full_name || "Customer",
          reference,
        });
      } else {
        // Monnify payment
        payment = await (paymentModule as typeof import("@/lib/api/monnify")).initializePayment({
          amount,
          reference,
          email: userProfile.email || user.email!,
          fullName: userProfile.full_name || "Customer",
          description: "SMMPanel Wallet Top-up",
        });
      }

      // Log pending transaction
      await adminClient.from("wallet_transactions").insert({
        user_id: user.id,
        type: "credit",
        amount,
        status: "pending",
        method: "transfer",
        reference: payment.reference || reference,
        description: "Wallet top-up (pending)",
      });

      return NextResponse.json({
        checkoutUrl: payment.checkoutUrl,
        reference: payment.reference || reference,
      });
    } catch (paymentError) {
      console.error("Payment initialization error:", paymentError);
      return NextResponse.json({ 
        error: "Payment gateway unavailable. Please try again later." 
      }, { status: 502 });
    }
  } catch (err) {
    console.error("[POST /api/wallet/fund]", err);
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
  }
}
