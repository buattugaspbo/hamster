export const MINIMUM_DELIVERY_SUBTOTAL = 100_000;
export const WOOD_PACKING_COST = 8_000;

export type DeliveryMethod = "pickup" | "delivery";
export type PackingType = "standard" | "toples" | "kayu";

export function canUseDelivery(subtotal: number) {
  return subtotal >= MINIMUM_DELIVERY_SUBTOTAL;
}

export function calculatePackingCost(
  orderType: "reservation" | "order",
  deliveryMethod: DeliveryMethod,
  packingType: PackingType,
) {
  return orderType === "reservation" && deliveryMethod === "delivery" && packingType === "kayu"
    ? WOOD_PACKING_COST
    : 0;
}

export function describePacking(orderType: "reservation" | "order", packingType: PackingType) {
  if (orderType !== "reservation") return "Packing standar perlengkapan";
  return packingType === "kayu"
    ? "Toples berventilasi + pelindung kayu"
    : "Toples berventilasi";
}
