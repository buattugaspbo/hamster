import { createHmac, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "../../../../lib/supabase/admin";

function validSignature(raw: string, signature: string, secret: string) {
  const expected = Buffer.from(createHmac("sha256", secret).update(raw).digest("hex"));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function POST(request: Request) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: "Webhook belum dikonfigurasi" }, { status: 503 });
  const raw = await request.text();
  if (!validSignature(raw, request.headers.get("x-hop-signature") || "", secret)) return Response.json({ error: "Signature tidak valid" }, { status: 401 });
  const body = JSON.parse(raw) as { orderId?: string; status?: string };
  if (!body.orderId || body.status !== "paid") return Response.json({ error: "Payload tidak valid" }, { status: 400 });
  const { error } = await createAdminClient().rpc("update_store_order", {
    p_order_id: body.orderId, p_payment_status: "Dibayar", p_fulfillment_status: "Diproses",
    p_pickup_at: null, p_notes: null,
  });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
