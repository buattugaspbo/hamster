import { replenishLowStock } from "../../../../lib/restock-server";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Tidak diizinkan" }, { status: 401 });
  }
  try {
    return Response.json({ ok: true, ...(await replenishLowStock()) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Restock otomatis gagal" }, { status: 500 });
  }
}
