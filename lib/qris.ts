const QRIS_DYNAMIC_METHOD = "12";

export const DEFAULT_QRIS_PAYLOAD = "00020101021126570011ID.DANA.WWW011893600915303270621302090327062130303UMI51440014ID.CO.QRIS.WWW0215ID10265345984810303UMI5204481453033605802ID5922Maju teknologi digital6015Kota Jakarta Pu61051012063042129";

type TlvField = { id: string; value: string };

export function crc16Ccitt(value: string) {
  let crc = 0xffff;
  for (let index = 0; index < value.length; index += 1) {
    crc ^= value.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function parseQris(payload: string): TlvField[] {
  const clean = payload.trim();
  const fields: TlvField[] = [];
  let cursor = 0;
  while (cursor < clean.length) {
    const id = clean.slice(cursor, cursor + 2);
    const lengthText = clean.slice(cursor + 2, cursor + 4);
    if (!/^\d{2}$/.test(id) || !/^\d{2}$/.test(lengthText)) throw new Error("Payload QRIS tidak valid");
    const length = Number(lengthText);
    const value = clean.slice(cursor + 4, cursor + 4 + length);
    if (value.length !== length) throw new Error("Panjang field QRIS tidak valid");
    fields.push({ id, value });
    cursor += 4 + length;
  }
  return fields;
}

export function validateQris(payload: string) {
  const clean = payload.trim();
  const fields = parseQris(clean);
  const crc = fields.find((field) => field.id === "63");
  if (!crc || crc.value.length !== 4) return false;
  return crc16Ccitt(clean.slice(0, -4)) === crc.value.toUpperCase();
}

function encodeField(field: TlvField) {
  return `${field.id}${String(field.value.length).padStart(2, "0")}${field.value}`;
}

export function createDynamicQris(staticPayload: string, amount: number) {
  if (!Number.isInteger(amount) || amount < 1) throw new Error("Nominal QRIS tidak valid");
  if (!validateQris(staticPayload)) throw new Error("Payload QRIS merchant gagal diverifikasi");
  const fields = parseQris(staticPayload)
    .filter((field) => field.id !== "54" && field.id !== "63")
    .map((field) => field.id === "01" ? { ...field, value: QRIS_DYNAMIC_METHOD } : field);
  if (!fields.some((field) => field.id === "01")) fields.splice(1, 0, { id: "01", value: QRIS_DYNAMIC_METHOD });
  const countryIndex = fields.findIndex((field) => Number(field.id) > 54);
  fields.splice(countryIndex === -1 ? fields.length : countryIndex, 0, { id: "54", value: String(amount) });
  const withoutChecksum = `${fields.map(encodeField).join("")}6304`;
  return `${withoutChecksum}${crc16Ccitt(withoutChecksum)}`;
}
