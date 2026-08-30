import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccountOrder } from "../../../../lib/account-data";
import { createWhatsAppUrl } from "../../../../lib/contact";
import { formatRupiah } from "../../../../lib/data";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getAccountOrder(id);
  if (!order) notFound();
  const waiting = order.paymentStatus !== "Dibayar";

  return <>
    <div className="breadcrumb"><Link href="/account/orders">Pesanan</Link><span>/</span><strong>{id}</strong></div>
    <div className="account-heading account-heading--order"><div><p className="eyebrow">DETAIL TRANSAKSI</p><h1>{id}</h1><p>Dibuat {order.createdAt ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(order.createdAt)) : "—"}</p></div><b className={`order-status order-status--${waiting ? "waiting" : "process"}`}>{waiting ? order.paymentStatus : order.fulfillmentStatus}</b></div>
    <section className="order-detail-grid">
      <div>
        <article className="order-detail-card">
          <h2>Item pesanan</h2>
          {order.items.map((item) => <div className="detail-order-item" key={item.id}><div className="order-product-icon">H&H</div><div><small>{order.type === "reservation" ? "RESERVASI HEWAN" : "PERLENGKAPAN"}</small><h3>{item.productName} × {item.quantity}</h3></div><strong>{formatRupiah(item.unitPrice * item.quantity)}</strong></div>)}
          <div className="order-price-row"><span>Subtotal</span><b>{formatRupiah(order.subtotal)}</b></div>
          <div className="order-price-row"><span>Ongkir & packing</span><b>{formatRupiah(order.shippingCost)}</b></div>
          <div className="order-price-row total"><span>Total</span><b>{formatRupiah(order.total)}</b></div>
        </article>
        {order.shippingAddress && <article className="order-detail-card"><h2>Alamat pengiriman</h2><p>{order.shippingAddress}</p></article>}
      </div>
      <aside className="order-side">
        <h2>Status pesanan</h2>
        <div className="vertical-status"><div className="done"><i>✓</i><p><strong>Pesanan dibuat</strong><span>{order.createdAt ? new Date(order.createdAt).toLocaleString("id-ID") : ""}</span></p></div><div className={waiting ? "active" : "done"}><i>{waiting ? "2" : "✓"}</i><p><strong>{order.paymentStatus}</strong><span>Metode QRIS</span></p></div><div className={!waiting ? "active" : ""}><i>3</i><p><strong>{order.fulfillmentStatus}</strong><span>Diproses oleh tim toko</span></p></div></div>
        {waiting && <Link href={`/payment/${id}`} className="button button--solid">Bayar sekarang</Link>}
        <a href={createWhatsAppUrl(`Halo HOP & HAM, saya butuh bantuan untuk pesanan ${id}.`)}>Butuh bantuan? Hubungi kami</a>
      </aside>
    </section>
  </>;
}
