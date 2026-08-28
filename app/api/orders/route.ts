import { getAuthenticatedUser, isCurrentUserAdmin } from "../../../lib/auth";
import { quoteShipping } from "../../../lib/shipping";
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
    const items = Array.from(input.items.reduce((map, item) => {
      map.set(item.productId, (map.get(item.productId) || 0) + item.quantity);
      return map;
    }, new Map<string, number>()), ([product_id, quantity]) => ({ product_id, quantity }));
    const quote = input.type === "order" ? quoteShipping(input.regencyCode) : null;
    if (input.type === "order" && !quote) return Response.json({ error: "Kota tujuan belum dapat dihitung ongkirnya" }, { status: 422 });
    const user = await getAuthenticatedUser();
    const { data, error } = await createAdminClient().rpc("create_store_order", {
      p_order_id: createOrderId(input.type), p_user_id: user?.id || null,
      p_customer_name: input.customerName, p_phone: input.phone, p_email: input.email || "",
      p_type: input.type, p_pickup_at: input.pickupAt, p_notes: input.notes,
      p_shipping_address: input.shippingAddress, p_regency_code: input.regencyCode,
      p_shipping_distance_km: quote?.distanceKm ?? null, p_shipping_cost: quote?.cost ?? 0,
      p_items: items,
    });
    if (error) throw error;
    const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown>;
    return Response.json({ order: serializeOrder(row), paymentToken: row.payment_token }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Gagal membuat pesanan" }, { status: 400 });
  }
}
