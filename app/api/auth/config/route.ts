import { requireSupabasePublicEnv } from "../../../../lib/supabase/env";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { url, key } = requireSupabasePublicEnv();
    return Response.json({ url, key }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json({ error: "Konfigurasi akun belum tersedia." }, { status: 503 });
  }
}
