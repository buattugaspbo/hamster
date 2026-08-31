import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { parseQris, validateQris } from "../lib/qris";

const baseUrl = (process.env.SMOKE_BASE_URL || "https://hopandham.web.id").replace(/\/$/, "");
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("URL dan secret/service-role key Supabase diperlukan untuk membersihkan data smoke test.");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type CreatedOrder = {
  id: string;
  subtotal: number;
  shippingCost: number;
  total: number;
};

async function json<T>(response: Response): Promise<T> {
  const body = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
  return body;
}

async function main() {
  const productId = "p1";
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, price, stock")
    .eq("id", productId)
    .single();
  if (productError) throw productError;
  assert.ok(product.stock > 0, "Produk smoke test harus memiliki stok");

  let orderId = "";

  try {
    const created = await json<{ order: CreatedOrder; paymentToken: string }>(await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "Smoke Test HOP & HAM",
        phone: "081234567890",
        email: "",
        type: "order",
        deliveryMethod: "delivery",
        packingType: "standard",
        items: [{ productId, quantity: 1 }],
        pickupAt: new Date(Date.now() + 86_400_000).toISOString(),
        shippingAddress: "AUTOMATED SMOKE TEST — DELETE ME",
        regencyCode: "1671",
        districtCode: "167101",
        notes: "AUTOMATED_SMOKE_TEST_DELETE_ME",
      }),
    }));

    orderId = created.order.id;
    assert.match(orderId, /^ORD-/);
    assert.equal(created.order.subtotal, product.price);
    assert.equal(created.order.shippingCost, 15_500);
    assert.equal(created.order.total, product.price + 15_500);

    const query = `?token=${encodeURIComponent(created.paymentToken)}`;
    const detail = await json<{ order: CreatedOrder & { paymentStatus: string } }>(await fetch(`${baseUrl}/api/orders/${orderId}${query}`));
    assert.equal(detail.order.total, created.order.total);
    assert.equal(detail.order.paymentStatus, "Menunggu");

    const qris = await json<{ dataUrl: string; amount: number }>(await fetch(`${baseUrl}/api/orders/${orderId}/qris${query}`));
    assert.equal(qris.amount, created.order.total);
    const png = PNG.sync.read(Buffer.from(qris.dataUrl.split(",")[1], "base64"));
    const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
    assert.ok(decoded?.data, "Gambar QRIS produksi tidak dapat dipindai kembali");
    assert.equal(validateQris(decoded.data), true);
    assert.equal(parseQris(decoded.data).find((field) => field.id === "54")?.value, String(created.order.total));

    const notice = await json<{ status: string }>(await fetch(`${baseUrl}/api/orders/${orderId}/payment-notice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: created.paymentToken }),
    }));
    assert.equal(notice.status, "Menunggu verifikasi");

    const { data: reduced, error: reducedError } = await supabase.from("products").select("stock").eq("id", productId).single();
    if (reducedError) throw reducedError;
    assert.equal(reduced.stock, product.stock - 1);

    console.log(`Smoke test lolos: order ${orderId}, total Rp${created.order.total.toLocaleString("id-ID")}, QRIS terbaca.`);
  } finally {
    if (orderId) {
      const { error: cancelError } = await supabase.rpc("update_store_order", {
        p_order_id: orderId,
        p_payment_status: null,
        p_fulfillment_status: "Dibatalkan",
        p_pickup_at: null,
        p_notes: "SMOKE_TEST_CLEANUP",
      });
      if (cancelError) throw new Error(`Cleanup gagal saat membatalkan ${orderId}: ${cancelError.message}`);

      const { data: restored, error: restoredError } = await supabase.from("products").select("stock").eq("id", productId).single();
      if (restoredError) throw restoredError;
      assert.equal(restored.stock, product.stock, `Stok ${productId} tidak kembali setelah smoke test`);

      const { error: deleteError } = await supabase.from("orders").delete().eq("id", orderId);
      if (deleteError) throw new Error(`Cleanup gagal saat menghapus ${orderId}: ${deleteError.message}`);
      console.log(`Cleanup selesai: ${orderId} dihapus dan stok ${productId} kembali ke ${product.stock}.`);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
