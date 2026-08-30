"use client";

import { createBrowserClient } from "@supabase/ssr";

type PublicSupabaseConfig = { url: string; key: string };

// Vercel injects server environment values at runtime, while browser bundles only
// receive public values at build time. Loading this public config from our own
// route keeps login working after an environment-variable change without needing
// to expose any server-only key.
export async function createClient() {
  const response = await fetch("/api/auth/config", { cache: "no-store" });
  const config = await response.json() as PublicSupabaseConfig & { error?: string };
  if (!response.ok || !config.url || !config.key) {
    throw new Error(config.error || "Akun belum siap digunakan. Coba lagi sebentar.");
  }
  const { url, key } = config;
  return createBrowserClient(url, key);
}
