import { getAccessibleOrder } from "../../../../../lib/order-access";
import { createAdminClient } from "../../../../../lib/supabase/admin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({})) as { token?: string };
  const order = await getAccessibleOrder(id, body.token);
  if (!order) return Response.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  if (order.payment_status === "Dibayar") return Response.json({ ok: true, status: "Dibayar" });
  if (new Date(order.expires_at).getTime() <= Date.now()) return Response.json({ error: "Batas pembayaran sudah berakhir" }, { status: 410 });
  const { error } = await createAdminClient().from("orders").update({ payment_status: "Menunggu verifikasi" }).eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true, status: "Menunggu verifikasi" });
}
