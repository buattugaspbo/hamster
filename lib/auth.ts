import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { hasSupabaseEnv } from "./supabase/env";

export type AuthenticatedUser = { id: string; email: string };

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return null;
  return { id: String(claims.sub), email: String(claims.email || "") };
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return data;
}

export async function requireUser(returnTo: string) {
  const user = await getAuthenticatedUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}

export async function isCurrentUserAdmin() {
  const user = await getAuthenticatedUser();
  if (!user) return false;
  const profile = await getUserProfile(user.id);
  return profile?.role === "admin";
}

export async function requireAdmin(returnTo: string) {
  const user = await requireUser(returnTo);
  const profile = await getUserProfile(user.id);
  if (profile?.role !== "admin") redirect("/account?error=admin-only");
  return { user, profile };
}
