"use client";

import Link from "next/link";
import { useState } from "react";
import { CatalogItem } from "../../../lib/data";
import { createWhatsAppUrl } from "../../../lib/contact";
import { addCartItem } from "../../../lib/cart";

export function ReserveActions({ item }: { item: CatalogItem }) {
  const [added, setAdded] = useState(false);

  const addToCart = () => {
    addCartItem(item.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="detail-actions">
      <Link href={`/checkout?animal=${item.id}`} className="button button--solid">Pesan langsung</Link>
      <a href={createWhatsAppUrl(`Halo HOP & HAM, saya ingin bertanya tentang ${item.name} (${item.code}).`)} className="button button--outline">Tanya via WhatsApp</a>
      <button type="button" className="detail-cart-action" onClick={addToCart}>{added ? "✓ Masuk keranjang" : "+ Tambah ke keranjang"}</button>
      <small>Hewan di keranjang tetap diproses dengan pilihan jadwal dan packing yang aman.</small>
    </div>
  );
}
