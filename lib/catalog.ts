import "server-only";
import { allItems, type CatalogItem } from "./data";
import { createAdminClient, hasSupabaseAdminEnv } from "./supabase/admin";

type ProductRow = Record<string, unknown>;

export function rowToCatalogItem(row: ProductRow): CatalogItem {
  return {
    id: String(row.id),
    slug: String(row.slug),
    kind: row.kind === "animal" ? "animal" : "supply",
    name: String(row.name),
    category: String(row.category),
    species: row.species === "Hamster" || row.species === "Kelinci" ? row.species : undefined,
    breed: row.breed ? String(row.breed) : undefined,
    sex: row.sex === "Jantan" || row.sex === "Betina" ? row.sex : undefined,
    age: row.age ? String(row.age) : undefined,
    code: row.code ? String(row.code) : undefined,
    temperament: row.temperament ? String(row.temperament) : undefined,
    price: Number(row.price),
    stock: Number(row.stock),
    status: String(row.status) as CatalogItem["status"],
    image: String(row.image),
    description: String(row.description || ""),
    featured: Boolean(row.featured),
    weightGrams: row.weight_grams == null ? undefined : Number(row.weight_grams),
    dimensions: row.dimensions ? String(row.dimensions) : undefined,
  };
}

export function catalogItemToRow(item: CatalogItem) {
  return {
    id: item.id,
    slug: item.slug,
    kind: item.kind,
    name: item.name,
    category: item.category,
    species: item.species ?? null,
    breed: item.breed ?? null,
    sex: item.sex ?? null,
    age: item.age ?? null,
    code: item.code ?? null,
    temperament: item.temperament ?? null,
    price: item.price,
    stock: item.stock,
    status: item.status,
    image: item.image,
    description: item.description,
    featured: item.featured ?? false,
    weight_grams: item.weightGrams ?? null,
    dimensions: item.dimensions ?? null,
  };
}

export async function getCatalog(): Promise<CatalogItem[]> {
  if (!hasSupabaseAdminEnv()) return allItems;
  const { data, error } = await createAdminClient()
    .from("products")
    .select("*")
    .order("kind")
    .order("name");
  if (error) throw new Error(error.message);
  return (data || []).map((row) => rowToCatalogItem(row));
}

export async function getProductBySlug(slug: string) {
  if (!hasSupabaseAdminEnv()) return allItems.find((item) => item.slug === slug) || null;
  const { data, error } = await createAdminClient()
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? rowToCatalogItem(data) : null;
}
