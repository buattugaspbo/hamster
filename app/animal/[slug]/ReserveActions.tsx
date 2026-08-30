"use client";

import Link from "next/link";
import { useState } from "react";
import { CatalogItem, getAnimalSexStock, type AnimalSex } from "../../../lib/data";
import { createWhatsAppUrl } from "../../../lib/contact";
import { addCartItem } from "../../../lib/cart";

export function ReserveActions({ item }: { item: CatalogItem }) {
  const [added, setAdded] = useState(false);
  const [sex, setSex] = useState<AnimalSex>("Jantan");
  const available = getAnimalSexStock(item, sex);

  const addToCart = () => {
    if (available < 1) return;
    addCartItem(item.id, sex);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="detail-actions">
      <div className="animal-sex-picker" aria-label="Pilih jenis kelamin">
        <span>Pilih jenis kelamin</span>
        {(["Jantan", "Betina"] as const).map((option) => <button type="button" key={option} className={sex === option ? "active" : ""} onClick={() => setSex(option)}>{option} <small>({getAnimalSexStock(item, option)} tersedia)</small></button>)}
      </div>
      <Link href={`/checkout?animal=${item.id}&sex=${sex}`} className="button button--solid">Pesan langsung</Link>
      <a href={createWhatsAppUrl(`Halo HOP & HAM, saya ingin bertanya tentang ${item.name} (${item.code}).`)} className="button button--outline">Tanya via WhatsApp</a>
      <button type="button" className="detail-cart-action" disabled={available < 1} onClick={addToCart}>{added ? "✓ Masuk keranjang" : "+ Tambah ke keranjang"}</button>
      <small>Hewan di keranjang tetap diproses dengan pilihan jadwal dan packing yang aman.</small>
    </div>
  );
}
