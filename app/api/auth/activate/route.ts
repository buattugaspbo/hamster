import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createAdminClient, hasSupabaseAdminEnv } from "../../../../lib/supabase/admin";
import { requireSupabasePublicEnv } from "../../../../lib/supabase/env";

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
});

const isEmailNotConfirmed = (reason: { message?: string; code?: string } | null) =>
  Boolean(reason && (reason.code === "email_not_confirmed" || /email.*not.*confirm/i.test(reason.message || "")));

export async function POST(request: Request) {
  try {
    const { email, password } = schema.parse(await request.json());
    if (!hasSupabaseAdminEnv()) {
      return Response.json({ error: "Pendaftaran instan belum tersedia." }, { status: 503 });
    }

    const { url, key } = requireSupabasePublicEnv();
    const auth = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
    const { error: signInError } = await auth.auth.signInWithPassword({ email, password });
    if (!isEmailNotConfirmed(signInError)) {
      return Response.json({ error: "Email atau kata sandi belum cocok." }, { status: 401 });
    }

    // An account is activated only after Supabase has accepted its password.
    const admin = createAdminClient();
    const { data: users, error: usersError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersError) throw usersError;
    const user = users.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());
    if (!user) return Response.json({ error: "Akun tidak ditemukan." }, { status: 404 });

    const { error: updateError } = await admin.auth.admin.updateUserById(user.id, { email_confirm: true });
    if (updateError) throw updateError;
    return Response.json({ activated: true });
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : "Akun belum bisa diaktifkan.";
    return Response.json({ error: message }, { status: 400 });
  }
}
