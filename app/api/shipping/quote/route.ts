import { quoteShipping } from "../../../../lib/shipping";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { regencyCode?: string; districtCode?: string };
    const quote = quoteShipping(String(body.regencyCode || ""), String(body.districtCode || ""));
    if (!quote) return Response.json({ error: "Pilih kecamatan yang tersedia agar jarak dan ongkir dapat dihitung." }, { status: 422 });
    return Response.json({ quote });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Gagal menghitung ongkir" }, { status: 400 });
  }
}
