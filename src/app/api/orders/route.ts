import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { placeProviderOrder } from "@/lib/api/smm-provider";
import { ALL_SERVICES } from "@/lib/constants";
import { calcCost } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = rateLimit(req, 10, 60000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { serviceId, link, quantity } = body as {
      serviceId: number;
      link: string;
      quantity: number;
    };

    // Validate input
    if (!serviceId || !link || !quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (typeof quantity !== "number" || quantity <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const service = ALL_SERVICES.find((s) => s.id === serviceId);
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    if (quantity < service.min || quantity > service.max) {
      return NextResponse.json(
        { error: `Quantity must be between ${service.min} and ${service.max}` },
        { status: 400 }
      );
    }

    const cost = calcCost(quantity, service.rate);

    // Use admin client to bypass RLS
    const adminClient = createAdminClient();

    // Atomically deduct wallet balance (prevents race conditions)
    const { data: deductResult, error: deductError } = await adminClient.rpc(
      "deduct_wallet_balance",
      {
        p_user_id: user.id,
        p_amount: cost,
      }
    );

    if (deductError) {
      console.error("[POST /api/orders] Deduct error:", deductError);
      return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
    }

    if (deductResult === false) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
    }

    // Place order with provider
    let providerOrderId: number | null = null;
    try {
      const providerRes = await placeProviderOrder({
        service: serviceId,
        link,
        quantity,
      });
      providerOrderId = providerRes.order;
    } catch (providerError) {
      // Provider order failed — refund and abort
      console.error("[POST /api/orders] Provider error:", providerError);
      await adminClient.rpc("credit_wallet_balance", {
        p_user_id: user.id,
        p_amount: cost,
      });
      return NextResponse.json({ error: "Failed to place order with provider" }, { status: 502 });
    }

    // Save order to DB
    const { data: order, error: orderError } = await adminClient
      .from("orders")
      .insert({
        user_id: user.id,
        service_id: serviceId,
        service_name: service.name,
        link,
        quantity,
        amount: cost,
        status: "Pending",
        provider_order_id: providerOrderId,
      })
      .select()
      .single();

    if (orderError) {
      console.error("[POST /api/orders] Order insert error:", orderError);
      // Refund if order creation fails
      await adminClient.rpc("credit_wallet_balance", {
        p_user_id: user.id,
        p_amount: cost,
      });
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // Log wallet transaction
    await adminClient.from("wallet_transactions").insert({
      user_id: user.id,
      type: "debit",
      amount: cost,
      status: "success",
      description: `Order: ${service.name}`,
    });

    return NextResponse.json({ order });
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
