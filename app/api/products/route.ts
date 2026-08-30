import { allItems } from "../../../lib/data";
import { isCurrentUserAdmin } from "../../../lib/auth";
import { serializeProduct } from "../../../lib/serializers";
import { createAdminClient, hasSupabaseAdminEnv } from "../../../lib/supabase/admin";
import { replenishLowStock } from "../../../lib/restock-server";
import { productInputSchema } from "../../../lib/validation";

export async function GET() {
  if (!hasSupabaseAdminEnv()) return Response.json({ products: allItems, source: "fallback" });
  await replenishLowStock();
  const { data, error } = await createAdminClient().from("products").select("*").order("kind").order("name");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ products: (data || []).map(serializeProduct), source: "supabase" });
}

export async function POST(request: Request) {
  if (!(await isCurrentUserAdmin())) return Response.json({ error: "Akses admin diperlukan" }, { status: 403 });
  try {
    const input = productInputSchema.parse(await request.json());
    const baseSlug = input.slug || input.name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { data, error } = await createAdminClient().from("products")
      .insert({
        id: `${input.kind === "animal" ? "a" : "p"}-${crypto.randomUUID().slice(0, 8)}`,
        slug: baseSlug, kind: input.kind, name: input.name, category: input.category,
        species: input.species || null, breed: input.breed || null, sex: input.sex || null,
        age: input.age || null, code: input.code || null, temperament: input.temperament || null,
        price: input.price, stock: input.stock, status: input.status, health: input.health,
        image: input.image, description: input.description, featured: input.featured,
        weight_grams: input.weightGrams ?? null, dimensions: input.dimensions || null,
      }).select().single();
    if (error) throw error;
    return Response.json({ product: serializeProduct(data) }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Gagal menambah produk" }, { status: 400 });
  }
}
