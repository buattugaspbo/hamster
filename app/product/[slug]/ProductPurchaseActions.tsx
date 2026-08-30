"use client";

import { useState } from "react";
import { addCartItem } from "../../../lib/cart";

export function ProductPurchaseActions({ id, stock }: { id: string; stock: number }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const add = () => {
    for (let index = 0; index < quantity; index += 1) addCartItem(id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };
  return <div className="product-purchase-actions"><label>Jumlah<div><button type="button" disabled={quantity <= 1} onClick={() => setQuantity((value) => value - 1)}>−</button><input aria-label="Jumlah produk" type="number" min={1} max={stock} value={quantity} onChange={(event) => setQuantity(Math.min(stock, Math.max(1, Number(event.target.value) || 1)))} /><button type="button" disabled={quantity >= stock} onClick={() => setQuantity((value) => value + 1)}>+</button></div></label><button type="button" className="button button--solid" disabled={stock < 1} onClick={add}>{added ? "✓ Masuk keranjang" : "+ Tambah ke keranjang"}</button></div>;
}
