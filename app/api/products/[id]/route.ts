import { isCurrentUserAdmin } from "../../../../lib/auth";
import { serializeProduct } from "../../../../lib/serializers";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { productPatchSchema } from "../../../../lib/validation";

function toDatabasePatch(input: Record<string, unknown>) {
  const patch: Record<string, unknown> = {};
  const direct = ["name", "slug", "category", "species", "breed", "sex", "age", "code", "temperament", "price", "stock", "status", "health", "image", "description", "featured", "dimensions"];
  direct.forEach((key) => { if (input[key] !== undefined) patch[key] = input[key]; });
  if (input.weightGrams !== undefined) patch.weight_grams = input.weightGrams;
  return patch;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await createAdminClient().from("products").select("*").eq("id", id).maybeSingle();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!data) return Response.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  return Response.json({ product: serializeProduct(data) });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isCurrentUserAdmin())) return Response.json({ error: "Akses admin diperlukan" }, { status: 403 });
  try {
    const { id } = await params;
    const input = productPatchSchema.parse(await request.json());
    const { data, error } = await createAdminClient().from("products")
      .update(toDatabasePatch(input)).eq("id", id).select().maybeSingle();
    if (error) throw error;
    if (!data) return Response.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    return Response.json({ product: serializeProduct(data) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Gagal menyimpan perubahan" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isCurrentUserAdmin())) return Response.json({ error: "Akses admin diperlukan" }, { status: 403 });
  const { id } = await params;
  const { error } = await createAdminClient().from("products").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
