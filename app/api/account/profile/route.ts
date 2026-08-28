import { z } from "zod";
import { getAuthenticatedUser } from "../../../../lib/auth";
import { createClient } from "../../../../lib/supabase/server";

const schema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{7,19}$/),
  birthday: z.string().date().optional().or(z.literal("")),
  gender: z.string().trim().max(40).optional().or(z.literal("")),
});

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return Response.json({ error: "Belum masuk" }, { status: 401 });
  const { data, error } = await (await createClient()).from("profiles").select("*").eq("id", user.id).single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ profile: data, email: user.email });
}

export async function PATCH(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return Response.json({ error: "Belum masuk" }, { status: 401 });
  try {
    const input = schema.parse(await request.json());
    const { data, error } = await (await createClient()).from("profiles").update({
      full_name: input.fullName, phone: input.phone,
      birthday: input.birthday || null, gender: input.gender || null,
    }).eq("id", user.id).select().single();
    if (error) throw error;
    return Response.json({ profile: data });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Profil gagal disimpan" }, { status: 400 });
  }
}
