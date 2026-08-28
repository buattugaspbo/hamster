import { isCurrentUserAdmin } from "../../../../lib/auth";
import { getAccessibleOrder } from "../../../../lib/order-access";
import { serializeOrder } from "../../../../lib/serializers";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { orderPatchSchema } from "../../../../lib/validation";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getAccessibleOrder(id, new URL(request.url).searchParams.get("token"));
  if (!order) return Response.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  return Response.json({ order: serializeOrder(order) });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isCurrentUserAdmin())) return Response.json({ error: "Akses admin diperlukan" }, { status: 403 });
  try {
    const { id } = await params;
    const input = orderPatchSchema.parse(await request.json());
    const { data, error } = await createAdminClient().rpc("update_store_order", {
      p_order_id: id, p_payment_status: input.paymentStatus ?? null,
      p_fulfillment_status: input.fulfillmentStatus ?? null,
      p_pickup_at: input.pickupAt ?? null, p_notes: input.notes ?? null,
    });
    if (error) throw error;
    const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown>;
    return Response.json({ order: serializeOrder(row) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Gagal menyimpan perubahan" }, { status: 400 });
  }
}
