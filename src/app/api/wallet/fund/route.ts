import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { initializePayment, generateReference } from "@/lib/api/monnify";
import { rateLimit } from "@/lib/rate-limit";

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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    // If profile doesn't exist, create it
    if (profileError || !profile) {
      console.log("Profile not found, creating one for user:", user.id);
      
      const { error: createError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          wallet_balance: 0,
          role: "user",
        });

      if (createError) {
        console.error("Failed to create profile:", createError);
        return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 });
      }

      // Fetch the newly created profile
      const { data: newProfile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();

      if (!newProfile) {
        return NextResponse.json({ error: "Failed to retrieve profile" }, { status: 500 });
      }

      // Use the new profile
      return await processPayment(supabase, user, newProfile, amount);
    }

    return await processPayment(supabase, user, profile, amount);
  } catch (err) {
    console.error("[POST /api/wallet/fund]", err);
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
  }
}

async function processPayment(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: { id: string; email?: string },
  profile: { full_name: string; email: string },
  amount: number
) {
  // Generate payment reference
  const reference = generateReference(user.id);

  try {
    // Initialize Monnify payment
    const payment = await initializePayment({
      amount,
      reference,
      email: profile.email || user.email!,
      fullName: profile.full_name || "Customer",
      description: "SMMPanel Wallet Top-up",
    });

    // Log pending transaction
    await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      type: "credit",
      amount,
      status: "pending",
      method: "transfer",
      reference: payment.transactionReference,
      description: "Wallet top-up (pending)",
    });

    return NextResponse.json({
      checkoutUrl: payment.checkoutUrl,
      reference: payment.transactionReference,
    });
  } catch (paymentError) {
    console.error("Monnify payment error:", paymentError);
    return NextResponse.json({ 
      error: "Payment gateway unavailable. Please try again later." 
    }, { status: 502 });
  }
}
