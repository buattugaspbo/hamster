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

test("harga katalog mengikuti kebijakan harga toko", () => {
  const hamsters = allItems.filter((item) => item.species === "Hamster");
  const cages = allItems.filter((item) => item.category === "Habitat & Kandang");

  assert.ok(hamsters.every((item) => item.price >= 20_000 && item.price <= 50_000));
  assert.equal(allItems.find((item) => item.id === "p1")?.price, 875_000);
  assert.equal(allItems.find((item) => item.id === "p12")?.price, 61_000);
  assert.ok(cages.every((item) => item.price > 0));
});
