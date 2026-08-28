import { quoteShipping } from "../../../../lib/shipping";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { regencyCode?: string };
    const quote = quoteShipping(String(body.regencyCode || ""));
    if (!quote) return Response.json({ error: "Wilayah tujuan belum memiliki koordinat." }, { status: 422 });
    return Response.json({ quote });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Gagal menghitung ongkir" }, { status: 400 });
  }
}
