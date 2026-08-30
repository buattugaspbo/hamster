import { getAuthenticatedUser, isCurrentUserAdmin } from "../../../lib/auth";
import { calculatePackingCost, canUseDelivery, describePacking } from "../../../lib/checkout";
import { quoteShipping } from "../../../lib/shipping";
import { automaticRestockTarget, needsAutomaticRestock } from "../../../lib/restock";
import { replenishLowStock } from "../../../lib/restock-server";
import { serializeOrder } from "../../../lib/serializers";
import { createAdminClient } from "../../../lib/supabase/admin";
import { orderInputSchema } from "../../../lib/validation";

function createOrderId(type: "reservation" | "order") {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Jakarta", year: "2-digit", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const value = (kind: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === kind)?.value || "00";
  const date = `${value("year")}${value("month")}${value("day")}`;
  return `${type === "reservation" ? "RSV" : "ORD"}-${date}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

export async function GET() {
  if (!(await isCurrentUserAdmin())) return Response.json({ error: "Akses admin diperlukan" }, { status: 403 });
  const { data, error } = await createAdminClient().from("orders")
    .select("*, order_items(*)").order("created_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ orders: (data || []).map(serializeOrder) });
}

export async function POST(request: Request) {
  try {
    const input = orderInputSchema.parse(await request.json());
    await replenishLowStock();
    const items = Array.from(input.items.reduce((map, item) => {
      map.set(item.productId, (map.get(item.productId) || 0) + item.quantity);
      return map;
    }, new Map<string, number>()), ([product_id, quantity]) => ({ product_id, quantity }));
    const admin = createAdminClient();
    const productIds = items.map((item) => item.product_id);
    const { data: products, error: productError } = await admin.from("products").select("id, price, stock, kind, species").in("id", productIds);
    if (productError) throw productError;
    const priceById = new Map((products || []).map((product) => [String(product.id), Number(product.price)]));
    if (priceById.size !== productIds.length) return Response.json({ error: "Ada produk yang tidak ditemukan" }, { status: 422 });
    const subtotal = items.reduce((sum, item) => sum + (priceById.get(item.product_id) || 0) * item.quantity, 0);
    const isDelivery = input.deliveryMethod === "delivery";
    if (isDelivery && !canUseDelivery(subtotal)) {
      return Response.json({ error: "Minimal belanja untuk pengantaran adalah Rp100.000" }, { status: 422 });
    }
    const quote = isDelivery ? quoteShipping(input.regencyCode, input.districtCode) : null;
    if (isDelivery && (!input.shippingAddress || !quote)) {
      return Response.json({ error: "Alamat lengkap dan kecamatan yang dikenali diperlukan untuk menghitung ongkir." }, { status: 422 });
    }
    const includesAnimal = (products || []).some((product) => product.kind === "animal");
    const packingType = includesAnimal ? "reservation" : "order";
    const packingCost = calculatePackingCost(packingType, input.deliveryMethod, input.packingType);
    const packingNote = isDelivery ? `Pengantaran · ${describePacking(packingType, input.packingType)}` : "Ambil di toko";
    const sexNote = input.items.filter((item) => item.sex).map((item) => {
      const product = (products || []).find((row) => String(row.id) === item.productId);
      return `${product ? String(product.id) : item.productId} ${item.sex} ×${item.quantity}`;
    }).join(", ");
    const notes = [packingNote, sexNote ? `Pilihan kelamin: ${sexNote}` : "", input.notes].filter(Boolean).join(". ");
    const user = await getAuthenticatedUser();
    const { data, error } = await admin.rpc("create_store_order", {
      p_order_id: createOrderId(input.type), p_user_id: user?.id || null,
      p_customer_name: input.customerName, p_phone: input.phone, p_email: input.email || "",
      p_type: "order", p_pickup_at: input.pickupAt, p_notes: notes,
      p_shipping_address: isDelivery ? input.shippingAddress : "", p_regency_code: isDelivery ? input.regencyCode : "",
      p_shipping_distance_km: quote?.distanceKm ?? null, p_shipping_cost: (quote?.cost ?? 0) + packingCost,
      p_items: items,
    });
    if (error) throw new Error(`Pesanan belum bisa dibuat: ${error.message}`);
    // Fungsi database lama menandai semua hewan sebagai "Direservasi" setelah
    // transaksi pertama. Dengan stok per gender, barang yang masih tersisa
    // harus tetap dapat dipesan pada transaksi berikutnya.
    await Promise.all((products || []).filter((product) => product.kind === "animal").map(async (product) => {
      const requested = items.find((item) => item.product_id === String(product.id))?.quantity || 0;
      const remaining = Math.max(0, Number(product.stock) - requested);
      await admin.from("products").update({ status: remaining === 0 ? "Stok habis" : remaining <= 5 ? "Stok menipis" : "Tersedia" }).eq("id", product.id);
    }));
    // Isi ulang langsung ketika sisa stok sudah 0 atau 1. Restock dilakukan
    // setelah transaksi tercatat agar pesanan yang sedang dibuat tetap sah.
    await Promise.all((products || []).flatMap((product) => {
      const requested = items.find((item) => item.product_id === String(product.id))?.quantity || 0;
      const restockable = {
        id: String(product.id),
        kind: product.kind === "animal" ? "animal" as const : "supply" as const,
        species: product.species == null ? null : String(product.species),
        stock: Number(product.stock),
      };
      if (!needsAutomaticRestock(restockable, requested)) return [];
      return [admin.from("products").update({ stock: automaticRestockTarget(restockable), status: "Tersedia" }).eq("id", product.id)];
    }));
    const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown>;
    return Response.json({ order: serializeOrder(row), paymentToken: row.payment_token }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Gagal membuat pesanan" }, { status: 400 });
  }
}
