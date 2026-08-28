import assert from "node:assert/strict";
import test from "node:test";
import { calculateShippingCost } from "../lib/shipping";

test("ongkir memiliki biaya dasar Rp10.000", () => {
  assert.equal(calculateShippingCost(0), 10000);
});

test("ongkir menambahkan Rp49 per kilometer lalu membulatkan Rp500", () => {
  assert.equal(calculateShippingCost(500), 34500);
});
