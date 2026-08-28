import assert from "node:assert/strict";
import test from "node:test";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { createDynamicQris, DEFAULT_QRIS_PAYLOAD, parseQris, validateQris } from "../lib/qris";

test("payload QRIS sumber memiliki CRC yang valid", () => {
  assert.equal(validateQris(DEFAULT_QRIS_PAYLOAD), true);
});

test("QRIS dinamis menyimpan nominal dan method dinamis", () => {
  const dynamic = createDynamicQris(DEFAULT_QRIS_PAYLOAD, 484500);
  const fields = parseQris(dynamic);
  assert.equal(validateQris(dynamic), true);
  assert.equal(fields.find((field) => field.id === "01")?.value, "12");
  assert.equal(fields.find((field) => field.id === "54")?.value, "484500");
});

test("gambar QRIS dinamis dapat dipindai kembali", async () => {
  const dynamic = createDynamicQris(DEFAULT_QRIS_PAYLOAD, 484500);
  const png = PNG.sync.read(await QRCode.toBuffer(dynamic, { width: 720, margin: 4, errorCorrectionLevel: "M" }));
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  assert.equal(decoded?.data, dynamic);
});
