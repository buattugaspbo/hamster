import { allItems } from "../lib/data";
import { createAdminClient } from "../lib/supabase/admin";

async function main() {
  const rows = allItems.map((item) => ({
    id: item.id, slug: item.slug, kind: item.kind, name: item.name, category: item.category,
    species: item.species ?? null, breed: item.breed ?? null, sex: item.sex ?? null,
    age: item.age ?? null, code: item.code ?? null, temperament: item.temperament ?? null,
    price: item.price, stock: item.stock, status: item.status, image: item.image,
    description: item.description, featured: item.featured ?? false,
    weight_grams: item.weightGrams ?? null, dimensions: item.dimensions ?? null,
  }));
  const { error } = await createAdminClient().from("products").upsert(rows, { onConflict: "id" });
  if (error) throw error;
  console.log(`Seed selesai: ${rows.length} produk tersimpan di Supabase.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
