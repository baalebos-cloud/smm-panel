import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use admin client to bypass RLS
    const adminClient = createAdminClient();

    // Check if profile exists
    const { data: existingProfile } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (existingProfile) {
      return NextResponse.json({ message: "Profile already exists", profile: existingProfile });
    }

    // Create profile if it doesn't exist
    const { data: newProfile, error } = await adminClient
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        wallet_balance: 0,
        role: "user",
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create profile:", error);
      return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
    }

    return NextResponse.json({ message: "Profile created", profile: newProfile });
  } catch (err) {
    console.error("[POST /api/auth/sync-profile]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
