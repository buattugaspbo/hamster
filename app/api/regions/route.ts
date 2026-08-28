import { fallbackRegions, type RegionOption } from "../../../lib/regions";

type ExternalRegion = Partial<RegionOption> & Record<string, unknown>;

function normalizeExternalRegions(payload: unknown): RegionOption[] {
  const value = payload as { data?: ExternalRegion[] } | ExternalRegion[];
  const rows = Array.isArray(value) ? value : value?.data;
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row) => {
    const code = String(row.code ?? row.id ?? "");
    const name = String(row.name ?? row.nama ?? "");
    if (!code || !name) return [];
    return [{ code, name, parentCode: row.parentCode ? String(row.parentCode) : undefined }];
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const level = url.searchParams.get("level") || "province";
  const parentCode = url.searchParams.get("parent") || undefined;
  const apiBase = process.env.INDONESIA_REGION_API_URL?.replace(/\/$/, "");

  if (apiBase) {
    try {
      const endpoint = new URL(`${apiBase}/${level}`);
      if (parentCode) endpoint.searchParams.set("parent", parentCode);
      const response = await fetch(endpoint, {
        headers: process.env.INDONESIA_REGION_API_TOKEN
          ? { Authorization: `Bearer ${process.env.INDONESIA_REGION_API_TOKEN}` }
          : undefined,
        next: { revalidate: 86400 },
      });
      if (response.ok) {
        const data = normalizeExternalRegions(await response.json());
        if (data.length) return Response.json({ source: "external", data });
      }
    } catch {
      // Fall through to the bundled dataset so checkout remains usable.
    }
  }

  return Response.json({ source: "fallback", data: fallbackRegions(level, parentCode) });
}
