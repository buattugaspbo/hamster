export function hasSupabaseEnv() {
  return Boolean(
    getSupabaseUrl() && getSupabasePublicKey(),
  );
}

export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL
    || process.env.SUPABASE_URL;
}

function getSupabasePublicKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function requireSupabasePublicEnv() {
  const url = getSupabaseUrl();
  const key = getSupabasePublicKey();
  if (!url || !key) {
    throw new Error("Supabase belum dikonfigurasi. Isi URL dan publishable/anon key Supabase.");
  }
  return { url, key };
}
