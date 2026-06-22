"use client";
import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import type { AppUser } from "@/types/user";

export function useAuth() {
  const { user, setUser } = useAppStore();
  const router = useRouter();
  const supabase = createClient();

  const fetchProfile = useCallback(async (userId: string): Promise<AppUser | null> => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (error || !profile) {
      console.log("Profile not found, syncing...");
      // Try to sync/create profile
      try {
        await fetch("/api/auth/sync-profile", { method: "POST" });
        // Retry fetching
        const { data: retryProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        return retryProfile as AppUser | null;
      } catch {
        return null;
      }
    }
    
    return profile as AppUser;
  }, [supabase]);

  // Fetch user on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const profile = await fetchProfile(authUser.id);
        setUser(profile);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const profile = await fetchProfile(session.user.id);
          setUser(profile);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [supabase, setUser, fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // Fetch and set profile immediately after sign in
    if (data.user) {
      const profile = await fetchProfile(data.user.id);
      setUser(profile);
    }
    
    router.push("/dashboard");
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    router.push("/auth/login?registered=true");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/auth/login");
  };

  return { user, signIn, signUp, signOut };
}
