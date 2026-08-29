"use client";

import Link from "next/link";
import { CatalogItem } from "../../../lib/data";

export function ReserveActions({ item }: { item: CatalogItem }) {
  const saveReservation = () => {
    localStorage.setItem("hop-reservation", item.id);
  };

  return (
    <div className="detail-actions">
      <Link href={`/checkout?animal=${item.id}`} onClick={saveReservation} className="button button--solid">Reservasi {item.name}</Link>
      <a href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo HOP & HAM, saya ingin bertanya tentang ${item.name} (${item.code}).`)}`} className="button button--outline">Tanya via WhatsApp</a>
      <small>Setelah dikonfirmasi, stok kami tahan 2 jam sambil menunggu pembayaran.</small>
    </div>
  );
}
