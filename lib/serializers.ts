import type { CatalogItem } from "./data";
import { rowToCatalogItem } from "./catalog";

export function serializeProduct(row: Record<string, unknown>): CatalogItem & {
  health: string;
  createdAt?: string;
  updatedAt?: string;
} {
  return {
    ...rowToCatalogItem(row),
    health: String(row.health || "Sehat"),
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export function serializeOrder(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : null,
    paymentToken: row.payment_token ? String(row.payment_token) : undefined,
    customerName: String(row.customer_name || ""),
    phone: String(row.phone || ""),
    email: row.email ? String(row.email) : null,
    type: String(row.type),
    itemName: Array.isArray(row.order_items)
      ? row.order_items.map((item) => String((item as Record<string, unknown>).product_name)).join(", ")
      : String(row.item_name || "Pesanan"),
    subtotal: Number(row.subtotal || 0),
    shippingCost: Number(row.shipping_cost || 0),
    total: Number(row.total || 0),
    paymentMethod: String(row.payment_method || "qris"),
    paymentStatus: String(row.payment_status || "Menunggu"),
    fulfillmentStatus: String(row.fulfillment_status || "Perlu dikonfirmasi"),
    pickupAt: row.pickup_at ? String(row.pickup_at) : null,
    notes: String(row.notes || ""),
    shippingAddress: row.shipping_address ? String(row.shipping_address) : null,
    regencyCode: row.regency_code ? String(row.regency_code) : null,
    shippingDistanceKm: row.shipping_distance_km == null ? null : Number(row.shipping_distance_km),
    expiresAt: row.expires_at ? String(row.expires_at) : null,
    paidAt: row.paid_at ? String(row.paid_at) : null,
    createdAt: row.created_at ? String(row.created_at) : null,
    updatedAt: row.updated_at ? String(row.updated_at) : null,
    items: Array.isArray(row.order_items)
      ? row.order_items.map((item) => {
        const value = item as Record<string, unknown>;
        return {
          id: String(value.id),
          productId: value.product_id ? String(value.product_id) : null,
          productName: String(value.product_name),
          unitPrice: Number(value.unit_price),
          quantity: Number(value.quantity),
        };
      })
      : [],
  };
}
