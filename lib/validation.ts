import { z } from "zod";

export const productInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().max(140).optional(),
  kind: z.enum(["animal", "supply"]),
  category: z.string().trim().min(1).max(100),
  species: z.string().trim().max(60).optional().nullable(),
  breed: z.string().trim().max(80).optional().nullable(),
  sex: z.string().trim().max(30).optional().nullable(),
  age: z.string().trim().max(40).optional().nullable(),
  code: z.string().trim().max(40).optional().nullable(),
  temperament: z.string().trim().max(120).optional().nullable(),
  price: z.coerce.number().int().min(0),
  stock: z.coerce.number().int().min(0),
  status: z.string().trim().min(1).max(40),
  health: z.string().trim().min(1).max(80).default("Sehat"),
  image: z.string().url(),
  description: z.string().trim().max(3000).default(""),
  featured: z.boolean().default(false),
  weightGrams: z.coerce.number().int().min(0).optional().nullable(),
  dimensions: z.string().trim().max(100).optional().nullable(),
});

export const productPatchSchema = productInputSchema.partial().omit({ kind: true });

export const orderInputSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{7,19}$/),
  email: z.string().trim().email().optional().or(z.literal("")),
  type: z.enum(["reservation", "order"]),
  items: z.array(z.object({
    productId: z.string().trim().min(1).max(100),
    quantity: z.coerce.number().int().min(1).max(20),
    sex: z.enum(["Jantan", "Betina"]).optional(),
  })).min(1).max(30),
  pickupAt: z.string().datetime({ offset: true }),
  deliveryMethod: z.enum(["pickup", "delivery"]).default("pickup"),
  packingType: z.enum(["standard", "toples", "kayu"]).default("standard"),
  notes: z.string().trim().max(2000).optional().default(""),
  shippingAddress: z.string().trim().max(1000).optional().default(""),
  regencyCode: z.string().trim().max(20).optional().default(""),
  districtCode: z.string().trim().max(20).optional().default(""),
});

export const orderPatchSchema = z.object({
  paymentStatus: z.enum(["Menunggu", "Menunggu verifikasi", "Dibayar", "Dikembalikan"]).optional(),
  fulfillmentStatus: z.enum(["Perlu dikonfirmasi", "Diproses", "Siap diambil", "Selesai", "Dibatalkan"]).optional(),
  pickupAt: z.string().datetime({ offset: true }).optional(),
  notes: z.string().trim().max(3000).optional(),
});

export const addressSchema = z.object({
  label: z.string().trim().min(1).max(40), recipientName: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{7,19}$/), addressLine: z.string().trim().min(5).max(600),
  district: z.string().trim().min(2).max(120), regencyCode: z.string().trim().min(1).max(20),
  regencyName: z.string().trim().min(2).max(120), provinceCode: z.string().trim().min(1).max(20),
  provinceName: z.string().trim().min(2).max(120), postalCode: z.string().trim().min(4).max(10),
  isPrimary: z.boolean().default(false),
});
