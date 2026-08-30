export type RegionOption = {
  code: string;
  name: string;
  parentCode?: string;
  latitude?: number;
  longitude?: number;
};

export const provinces: RegionOption[] = [
  { code: "16", name: "Sumatera Selatan" },
  { code: "15", name: "Jambi" },
  { code: "17", name: "Bengkulu" },
  { code: "18", name: "Lampung" },
  { code: "14", name: "Riau" },
  { code: "13", name: "Sumatera Barat" },
  { code: "12", name: "Sumatera Utara" },
  { code: "31", name: "DKI Jakarta" },
  { code: "32", name: "Jawa Barat" },
  { code: "33", name: "Jawa Tengah" },
  { code: "34", name: "DI Yogyakarta" },
  { code: "35", name: "Jawa Timur" },
  { code: "51", name: "Bali" },
  { code: "64", name: "Kalimantan Timur" },
  { code: "73", name: "Sulawesi Selatan" },
];

export const regencies: RegionOption[] = [
  { code: "1671", parentCode: "16", name: "Kota Palembang", latitude: -2.9761, longitude: 104.7754 },
  { code: "1674", parentCode: "16", name: "Kota Prabumulih", latitude: -3.4329, longitude: 104.2356 },
  { code: "1673", parentCode: "16", name: "Kota Lubuklinggau", latitude: -3.2967, longitude: 102.861 },
  { code: "1571", parentCode: "15", name: "Kota Jambi", latitude: -1.6101, longitude: 103.6131 },
  { code: "1771", parentCode: "17", name: "Kota Bengkulu", latitude: -3.7928, longitude: 102.2608 },
  { code: "1871", parentCode: "18", name: "Kota Bandar Lampung", latitude: -5.3971, longitude: 105.2668 },
  { code: "1471", parentCode: "14", name: "Kota Pekanbaru", latitude: 0.5071, longitude: 101.4478 },
  { code: "1371", parentCode: "13", name: "Kota Padang", latitude: -0.9471, longitude: 100.4172 },
  { code: "1271", parentCode: "12", name: "Kota Medan", latitude: 3.5952, longitude: 98.6722 },
  { code: "3171", parentCode: "31", name: "Kota Jakarta Selatan", latitude: -6.2615, longitude: 106.8106 },
  { code: "3273", parentCode: "32", name: "Kota Bandung", latitude: -6.9175, longitude: 107.6191 },
  { code: "3374", parentCode: "33", name: "Kota Semarang", latitude: -6.9667, longitude: 110.4167 },
  { code: "3471", parentCode: "34", name: "Kota Yogyakarta", latitude: -7.7956, longitude: 110.3695 },
  { code: "3578", parentCode: "35", name: "Kota Surabaya", latitude: -7.2575, longitude: 112.7521 },
  { code: "5171", parentCode: "51", name: "Kota Denpasar", latitude: -8.65, longitude: 115.2167 },
  { code: "6471", parentCode: "64", name: "Kota Balikpapan", latitude: -1.2379, longitude: 116.8529 },
  { code: "7371", parentCode: "73", name: "Kota Makassar", latitude: -5.1477, longitude: 119.4327 },
];

export const districts: RegionOption[] = [
  { code: "167101", parentCode: "1671", name: "Ilir Barat I", latitude: -2.9925, longitude: 104.7376 },
  { code: "167102", parentCode: "1671", name: "Ilir Barat II", latitude: -2.9821, longitude: 104.7213 },
  { code: "167103", parentCode: "1671", name: "Ilir Timur I", latitude: -2.9892, longitude: 104.7705 },
  { code: "167104", parentCode: "1671", name: "Ilir Timur II", latitude: -2.9562, longitude: 104.7864 },
  { code: "167105", parentCode: "1671", name: "Sukarami", latitude: -2.9052, longitude: 104.7357 },
  { code: "167106", parentCode: "1671", name: "Kemuning", latitude: -2.9734, longitude: 104.7654 },
];

export function fallbackRegions(level: string, parentCode?: string) {
  if (level === "province") return provinces;
  if (level === "regency") return regencies.filter((region) => !parentCode || region.parentCode === parentCode);
  if (level === "district") return districts.filter((region) => !parentCode || region.parentCode === parentCode);
  return [];
}
