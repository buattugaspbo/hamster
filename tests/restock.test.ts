import assert from "node:assert/strict";
import test from "node:test";
import { AUTO_RESTOCK_THRESHOLD, automaticRestockTarget, needsAutomaticRestock } from "../lib/restock";

test("restock otomatis berjalan saat stok sisa di bawah dua", () => {
  const item = { id: "p-test", kind: "supply" as const, stock: 2 };
  assert.equal(needsAutomaticRestock(item, 1), true);
  assert.equal(needsAutomaticRestock({ ...item, stock: 3 }, 1), false);
  assert.equal(AUTO_RESTOCK_THRESHOLD, 2);
});

test("target restock mengikuti jenis item", () => {
  assert.equal(automaticRestockTarget({ id: "a", kind: "animal", species: "Hamster", stock: 1 }), 20);
  assert.equal(automaticRestockTarget({ id: "b", kind: "animal", species: "Kelinci", stock: 1 }), 10);
  assert.equal(automaticRestockTarget({ id: "p", kind: "supply", stock: 1 }), 10);
});
