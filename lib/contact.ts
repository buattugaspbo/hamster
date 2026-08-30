export const PLACEHOLDER_WHATSAPP = "6280000000000";
export const PLACEHOLDER_WHATSAPP_LABEL = "0800-0000-0000";

export function createWhatsAppUrl(message = "Halo HOP & HAM, saya mau bertanya.") {
  return `https://wa.me/${PLACEHOLDER_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
