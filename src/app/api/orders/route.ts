import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { placeProviderOrder } from "@/lib/api/smm-provider";
import { ALL_SERVICES } from "@/lib/constants";
import { calcCost } from "@/lib/utils";

export async function POST(req: NextRequest) {
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

    const service = ALL_SERVICES.find((s) => s.id === serviceId);
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    if (quantity < service.min || quantity > service.max) {
      return NextResponse.json(
        { error: `Quantity must be between ${service.min} and ${service.max}` },
        { status: 400 }
      );
    }

    const cost = calcCost(quantity, service.rate);

    // Check and deduct wallet balance
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.wallet_balance < cost) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
    }

    // Deduct balance
    await supabase
      .from("profiles")
      .update({ wallet_balance: profile.wallet_balance - cost })
      .eq("id", user.id);

    // Place order with provider (comment out until you have real API key)
    let providerOrderId: number | null = null;
    try {
      const providerRes = await placeProviderOrder({
        service: serviceId,
        link,
        quantity,
      });
      providerOrderId = providerRes.order;
    } catch {
      // Provider order failed — refund and abort
      await supabase
        .from("profiles")
        .update({ wallet_balance: profile.wallet_balance })
        .eq("id", user.id);
      return NextResponse.json({ error: "Failed to place order with provider" }, { status: 502 });
    }

    // Save order to DB
    const { data: order, error: orderError } = await supabase
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

    if (orderError) throw orderError;

    // Log wallet transaction
    await supabase.from("wallet_transactions").insert({
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
