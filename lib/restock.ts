type RestockableProduct = { id: string; kind: "animal" | "supply"; species?: string | null; stock: number };

export const AUTO_RESTOCK_THRESHOLD = 2;

export function automaticRestockTarget(product: RestockableProduct) {
  if (product.kind !== "animal") return 10;
  return product.species === "Hamster" ? 20 : 10;
}

export function needsAutomaticRestock(product: RestockableProduct, orderedQuantity: number) {
  return product.stock - orderedQuantity < AUTO_RESTOCK_THRESHOLD;
}
