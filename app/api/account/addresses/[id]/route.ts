import { getAuthenticatedUser } from "../../../../../lib/auth";
import { createClient } from "../../../../../lib/supabase/server";
import { addressSchema } from "../../../../../lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return Response.json({ error: "Belum masuk" }, { status: 401 });
  try {
    const { id } = await params;
    const input = addressSchema.partial().parse(await request.json());
    const supabase = await createClient();
    if (input.isPrimary) await supabase.from("addresses").update({ is_primary: false }).eq("user_id", user.id);
    const patch: Record<string, unknown> = {};
    const mapping: Record<string, string> = { label: "label", recipientName: "recipient_name", phone: "phone", addressLine: "address_line", district: "district", regencyCode: "regency_code", regencyName: "regency_name", provinceCode: "province_code", provinceName: "province_name", postalCode: "postal_code", isPrimary: "is_primary" };
    Object.entries(mapping).forEach(([source, target]) => { if (input[source as keyof typeof input] !== undefined) patch[target] = input[source as keyof typeof input]; });
    const { data, error } = await supabase.from("addresses").update(patch).eq("id", id).eq("user_id", user.id).select().maybeSingle();
    if (error) throw error;
    if (!data) return Response.json({ error: "Alamat tidak ditemukan" }, { status: 404 });
    return Response.json({ address: data });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Alamat gagal diperbarui" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return Response.json({ error: "Belum masuk" }, { status: 401 });
  const { id } = await params;
  const { error } = await (await createClient()).from("addresses").delete().eq("id", id).eq("user_id", user.id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
