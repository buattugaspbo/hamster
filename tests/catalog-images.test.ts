import assert from "node:assert/strict";
import test from "node:test";
import { allItems, animals, supplies } from "../lib/data";

test("setiap hewan memakai foto yang berbeda", () => {
  const images = animals.map((item) => item.image);
  assert.equal(new Set(images).size, images.length);
});

test("setiap item katalog memiliki foto unik dan dapat dirender", () => {
  const images = allItems.map((item) => item.image);
  assert.equal(allItems.length, animals.length + supplies.length);
  assert.equal(new Set(images).size, images.length);
  assert.ok(images.every((image) => image.startsWith("https://") || image.startsWith("/")));
});
