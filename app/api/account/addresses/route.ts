import { getAuthenticatedUser } from "../../../../lib/auth";
import { createClient } from "../../../../lib/supabase/server";
import { addressSchema } from "../../../../lib/validation";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return Response.json({ error: "Belum masuk" }, { status: 401 });
  const { data, error } = await (await createClient()).from("addresses").select("*").order("is_primary", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ addresses: data || [] });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return Response.json({ error: "Belum masuk" }, { status: 401 });
  try {
    const input = addressSchema.parse(await request.json());
    const supabase = await createClient();
    if (input.isPrimary) await supabase.from("addresses").update({ is_primary: false }).eq("user_id", user.id);
    const { data, error } = await supabase.from("addresses").insert({
      user_id: user.id, label: input.label, recipient_name: input.recipientName, phone: input.phone,
      address_line: input.addressLine, district: input.district, regency_code: input.regencyCode,
      regency_name: input.regencyName, province_code: input.provinceCode, province_name: input.provinceName,
      postal_code: input.postalCode, is_primary: input.isPrimary,
    }).select().single();
    if (error) throw error;
    return Response.json({ address: data }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Alamat gagal disimpan" }, { status: 400 });
  }
}
