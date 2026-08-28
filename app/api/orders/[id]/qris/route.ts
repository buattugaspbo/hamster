import QRCode from "qrcode";
import { getAccessibleOrder } from "../../../../../lib/order-access";
import { createDynamicQris, DEFAULT_QRIS_PAYLOAD } from "../../../../../lib/qris";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await getAccessibleOrder(id, new URL(request.url).searchParams.get("token"));
    if (!order) return Response.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    if (order.payment_status !== "Dibayar" && new Date(order.expires_at).getTime() <= Date.now()) {
      return Response.json({ error: "Batas pembayaran sudah berakhir. Hubungi admin untuk mengaktifkan ulang pesanan." }, { status: 410 });
    }
    const staticPayload = process.env.QRIS_STATIC_PAYLOAD || DEFAULT_QRIS_PAYLOAD;
    const dataUrl = await QRCode.toDataURL(createDynamicQris(staticPayload, Number(order.total)), {
      errorCorrectionLevel: "M", margin: 4, width: 720,
      color: { dark: "#000000", light: "#ffffff" },
    });
    return Response.json({ dataUrl, amount: Number(order.total), expiresAt: order.expires_at });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "QRIS gagal dibuat" }, { status: 400 });
  }
}
