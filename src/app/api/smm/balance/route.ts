import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProviderBalance } from "@/lib/api/smm-provider";

export async function GET(req: NextRequest) {
  try {
    // Auth check - admin only
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const balance = await getProviderBalance();
    
    return NextResponse.json(balance);
  } catch (err) {
    console.error("[GET /api/smm/balance]", err);
    const message = err instanceof Error ? err.message : "Failed to fetch balance";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
