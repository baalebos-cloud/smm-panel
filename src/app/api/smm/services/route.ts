import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProviderServices } from "@/lib/api/smm-provider";

export async function GET(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const services = await getProviderServices();
    
    return NextResponse.json({ 
      services,
      count: services.length 
    });
  } catch (err) {
    console.error("[GET /api/smm/services]", err);
    const message = err instanceof Error ? err.message : "Failed to fetch services";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
