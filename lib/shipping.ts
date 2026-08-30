import { districts, regencies } from "./regions";

export const STORE_LOCATION = {
  code: "1671",
  name: "HOP & HAM Palembang",
  latitude: -2.9761,
  longitude: 104.7754,
};

export const SHIPPING_RATE_PER_KM = 49;
export const BASE_SHIPPING_COST = 10000;
export const SHIPPING_ROUNDING = 500;

const toRadians = (degrees: number) => degrees * (Math.PI / 180);

export function haversineDistanceKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
) {
  const earthRadiusKm = 6371;
  const deltaLatitude = toRadians(to.latitude - from.latitude);
  const deltaLongitude = toRadians(to.longitude - from.longitude);
  const latitude1 = toRadians(from.latitude);
  const latitude2 = toRadians(to.latitude);
  const a = Math.sin(deltaLatitude / 2) ** 2
    + Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(deltaLongitude / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateShippingCost(distanceKm: number) {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) throw new Error("Jarak tidak valid");
  const cost = BASE_SHIPPING_COST + distanceKm * SHIPPING_RATE_PER_KM;
  return Math.round(cost / SHIPPING_ROUNDING) * SHIPPING_ROUNDING;
}

export function quoteShipping(regencyCode: string, districtCode?: string) {
  const destination = regencies.find((region) => region.code === regencyCode);
  if (!destination?.latitude || !destination.longitude) return null;
  const district = districtCode ? districts.find((region) => region.code === districtCode && region.parentCode === regencyCode) : null;
  if (districtCode && (!district?.latitude || !district.longitude)) return null;
  const endpoint = district || destination;
  const rawDistance = haversineDistanceKm(STORE_LOCATION, {
    latitude: endpoint.latitude!,
    longitude: endpoint.longitude!,
  });
  const distanceKm = Math.round(rawDistance);
  return {
    origin: STORE_LOCATION,
    destination: endpoint,
    distanceKm,
    cost: calculateShippingCost(distanceKm),
    ratePerKm: SHIPPING_RATE_PER_KM,
    calculation: district ? "district-centroid-haversine" : "regency-centroid-haversine",
  };
}
