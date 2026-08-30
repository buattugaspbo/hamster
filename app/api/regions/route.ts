import { districts, fallbackRegions, provinces, regencies, type RegionOption, villages } from "../../../lib/regions";

type ExternalRegion = Partial<RegionOption> & Record<string, unknown>;
const NATIONAL_REGION_API = "https://wilayah.id/api";

function toNationalCode(code: string) {
  const digits = code.replace(/\D/g, "");
  if (digits.length === 2) return digits;
  if (digits.length === 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length === 6) return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
  if (digits.length === 10) return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`;
  return code;
}

function nationalEndpoint(level: string, parentCode?: string) {
  if (level === "province") return `${NATIONAL_REGION_API}/provinces.json`;
  if (!parentCode) return null;
  const parent = toNationalCode(parentCode);
  if (level === "regency") return `${NATIONAL_REGION_API}/regencies/${parent}.json`;
  if (level === "district") return `${NATIONAL_REGION_API}/districts/${parent}.json`;
  if (level === "village") return `${NATIONAL_REGION_API}/villages/${parent}.json`;
  return null;
}

function normalizeExternalRegions(payload: unknown): RegionOption[] {
  const value = payload as { data?: ExternalRegion[] } | ExternalRegion[];
  const rows = Array.isArray(value) ? value : value?.data;
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row) => {
    const code = String(row.code ?? row.id ?? "");
    const name = String(row.name ?? row.nama ?? "");
    if (!code || !name) return [];
    const localCode = code.replace(/\D/g, "");
    const local = [...provinces, ...regencies, ...districts, ...villages].find((region) => region.code === localCode);
    return [{ code, name, parentCode: row.parentCode ? String(row.parentCode) : undefined, postalCode: local?.postalCode }];
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const level = url.searchParams.get("level") || "province";
  const parentCode = url.searchParams.get("parent") || undefined;
  const apiBase = process.env.INDONESIA_REGION_API_URL?.replace(/\/$/, "");

  // Data Kemendagri 2025: 38 provinsi, 514 kabupaten/kota, 7.285 kecamatan,
  // dan 83.762 desa/kelurahan. Dimuat per induk agar browser tidak mengunduh
  // seluruh Indonesia sekaligus.
  const national = nationalEndpoint(level, parentCode);
  if (national) {
    try {
      const response = await fetch(national, { next: { revalidate: 2_592_000 } });
      if (response.ok) {
        const data = normalizeExternalRegions(await response.json());
        if (data.length) return Response.json({ source: "kemendagri-2025", data });
      }
    } catch {
      // Try the optional vendor below, then the bundled emergency fallback.
    }
  }

  if (apiBase) try {
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
    // Fall through to the bundled emergency fallback.
  }

  return Response.json({ source: "fallback", data: fallbackRegions(level, parentCode) });
}
