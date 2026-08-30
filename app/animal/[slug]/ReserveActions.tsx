"use client";

import Link from "next/link";
import { CatalogItem } from "../../../lib/data";
import { createWhatsAppUrl } from "../../../lib/contact";

export function ReserveActions({ item }: { item: CatalogItem }) {
  const saveReservation = () => {
    localStorage.setItem("hop-reservation", item.id);
  };

  return (
    <div className="detail-actions">
      <Link href={`/checkout?animal=${item.id}`} onClick={saveReservation} className="button button--solid">Reservasi {item.name}</Link>
      <a href={createWhatsAppUrl(`Halo HOP & HAM, saya ingin bertanya tentang ${item.name} (${item.code}).`)} className="button button--outline">Tanya via WhatsApp</a>
      <small>Setelah dikonfirmasi, stok kami tahan 2 jam sambil menunggu pembayaran.</small>
    </div>
  );
}
