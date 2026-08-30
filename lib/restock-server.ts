import "server-only";

import { automaticRestockTarget } from "./restock";
import { createAdminClient, hasSupabaseAdminEnv } from "./supabase/admin";

type LowStockRow = { id: string; kind: string; species: string | null; stock: number };

/** Replenishes every catalog item with stock 0 or 1. */
export async function replenishLowStock() {
  if (!hasSupabaseAdminEnv()) return { replenished: 0 };
  const admin = createAdminClient();
  const { data, error } = await admin.from("products").select("id, kind, species, stock").lt("stock", 2);
  if (error) throw new Error(`Restock otomatis gagal membaca stok: ${error.message}`);

  const lowStock = (data || []) as LowStockRow[];
  const updates = await Promise.all(lowStock.map((product) => {
    const item = {
      id: String(product.id),
      kind: product.kind === "animal" ? "animal" as const : "supply" as const,
      species: product.species,
      stock: Number(product.stock),
    };
    return admin.from("products").update({ stock: automaticRestockTarget(item), status: "Tersedia" }).eq("id", product.id);
  }));
  const failed = updates.find((result) => result.error);
  if (failed?.error) throw new Error(`Restock otomatis gagal menyimpan stok: ${failed.error.message}`);
  return { replenished: lowStock.length };
}
