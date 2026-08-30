import assert from "node:assert/strict";
import test from "node:test";
import { calculatePackingCost, canUseDelivery } from "../lib/checkout";

test("pengantaran membutuhkan subtotal minimal Rp100.000", () => {
  assert.equal(canUseDelivery(99_999), false);
  assert.equal(canUseDelivery(100_000), true);
});

test("packing kayu hewan menambah Rp8.000 hanya saat diantar", () => {
  assert.equal(calculatePackingCost("reservation", "delivery", "kayu"), 8_000);
  assert.equal(calculatePackingCost("reservation", "pickup", "kayu"), 0);
  assert.equal(calculatePackingCost("order", "delivery", "kayu"), 0);
});
