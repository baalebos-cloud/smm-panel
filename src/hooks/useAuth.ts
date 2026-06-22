"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import type { AppUser } from "@/types/user";

export function useAuth() {
  const { user, setUser } = useAppStore();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          setUser(profile as AppUser);
        } else {
          setUser(null);
        }
      }
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
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
