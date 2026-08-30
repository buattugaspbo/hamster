import assert from "node:assert/strict";
import test from "node:test";
import { calculateShippingCost, quoteShipping } from "../lib/shipping";

test("ongkir memiliki biaya dasar Rp10.000", () => {
  assert.equal(calculateShippingCost(0), 10000);
});

test("ongkir menambahkan Rp49 per kilometer lalu membulatkan Rp500", () => {
  assert.equal(calculateShippingCost(500), 34500);
});

test("ongkir pengantaran memakai kecamatan yang cocok dengan kota", () => {
  const quote = quoteShipping("1671", "167101");
  assert.equal(quote?.destination.code, "167101");
  assert.equal(quote?.calculation, "district-centroid-haversine");
  assert.equal(quoteShipping("1671", "3273"), null);
});
