"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatRupiah } from "../../lib/data";

type ProductRow = { id: string; name: string; category: string; stock: number; status: string; image: string; kind: string; };
type OrderRow = { id: string; customerName: string; itemName: string; total: number; paymentStatus: string; fulfillmentStatus: string; pickupAt?: string; createdAt?: string; type: string; };

export function DashboardClient() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json() as Promise<{ products?: ProductRow[]; error?: string }>),
      fetch("/api/orders").then((r) => r.json() as Promise<{ orders?: OrderRow[]; error?: string }>),
    ])
      .then(([p, o]) => { setProducts(p.products || []); setOrders(o.orders || []); setOffline(Boolean(p.error || o.error)); })
      .catch(() => setOffline(true));
  }, []);

  const revenue = useMemo(() => orders.filter((order) => order.paymentStatus === "Dibayar").reduce((sum, order) => sum + order.total, 0), [orders]);
  const lowStock = products.filter((product) => product.kind === "supply" && product.stock <= 5);
  const reservations = orders.filter((order) => order.type === "reservation" && order.fulfillmentStatus !== "Selesai");
  const activeOrders = orders.filter((order) => !["Selesai", "Dibatalkan"].includes(order.fulfillmentStatus));
  const waitingConfirmation = orders.filter((order) => order.paymentStatus === "Menunggu verifikasi");
  const today = new Date().toISOString().slice(0, 10);
  const pickupsToday = orders.filter((order) => order.pickupAt?.slice(0, 10) === today);
  const chart = Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - index));
    const key = date.toISOString().slice(0, 10);
    return orders.filter((order) => order.paymentStatus === "Dibayar" && order.createdAt?.slice(0, 10) === key).reduce((sum, order) => sum + order.total, 0);
  });
  const chartMax = Math.max(...chart, 1);
  const points = chart.map((value, index) => `${(index / (chart.length - 1)) * 100},${115 - (value / chartMax) * 90}`).join(" ");

  return (
    <main className="admin-content">
      <div className="admin-page-title"><div><p>OPERASIONAL TOKO</p><h1>Ringkasan toko</h1></div><span className={offline ? "sync-badge sync-badge--warn" : "sync-badge"}>{offline ? "Gagal memuat data" : "Terhubung ke Supabase"}</span></div>
      <section className="admin-kpis">
        <article><i>Rp</i><div><span>Pembayaran diterima</span><strong>{formatRupiah(revenue)}</strong><small>Dari pesanan berstatus dibayar</small></div></article>
        <article><i>↗</i><div><span>Pesanan aktif</span><strong>{activeOrders.length}</strong><small>Belum selesai atau dibatalkan</small></div></article>
        <article><i>◇</i><div><span>Reservasi aktif</span><strong>{reservations.length}</strong><small>Menunggu pengambilan</small></div></article>
        <article><i>!</i><div><span>Stok menipis</span><strong>{lowStock.length}</strong><small>Stok lima atau kurang</small></div></article>
      </section>
      <section className="admin-dashboard-grid">
        <article className="admin-panel admin-chart-panel">
          <div className="panel-heading"><div><h2>Penjualan 30 hari terakhir</h2><span>Total transaksi tercatat</span></div><select><option>30 hari terakhir</option></select></div>
          <div className="chart-wrap"><div className="chart-axis"><span>{formatRupiah(chartMax)}</span><span>{formatRupiah(chartMax * .75)}</span><span>{formatRupiah(chartMax * .5)}</span><span>{formatRupiah(chartMax * .25)}</span><span>Rp0</span></div><svg viewBox="0 0 100 125" preserveAspectRatio="none" aria-label="Grafik penjualan"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#315f44" stopOpacity=".22"/><stop offset="1" stopColor="#315f44" stopOpacity="0"/></linearGradient></defs><polygon points={`0,125 ${points} 100,125`} fill="url(#area)"/><polyline points={points} fill="none" stroke="#315f44" strokeWidth="1.2" vectorEffect="non-scaling-stroke"/></svg></div>
        </article>
        <article className="admin-panel attention-panel"><div className="panel-heading"><h2>Perlu ditangani</h2></div><Link href="/admin/orders"><i>{waitingConfirmation.length}</i><div><strong>Pembayaran menunggu pengecekan</strong><span>Cocokkan pembayaran yang masuk</span></div><b>→</b></Link><Link href="/admin/orders"><i>{reservations.length}</i><div><strong>Reservasi aktif</strong><span>Cek jadwal pengambilan</span></div><b>→</b></Link><Link href="/admin/inventory"><i>{lowStock.length}</i><div><strong>Stok hampir habis</strong><span>Produk dengan stok lima atau kurang</span></div><b>→</b></Link></article>
        <article className="admin-panel pickup-panel"><div className="panel-heading"><h2>Pengambilan hari ini</h2><Link href="/admin/orders">Lihat semua</Link></div><div className="admin-table mini-table"><div className="table-head"><span>Waktu</span><span>Pelanggan</span><span>Item</span><span>Status</span></div>{pickupsToday.slice(0, 5).map((order) => <div className="table-row" key={order.id}><span>{order.pickupAt ? new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }).format(new Date(order.pickupAt)) : "—"}</span><strong>{order.customerName}</strong><span>{order.itemName}</span><em className={`status-chip ${order.fulfillmentStatus === "Siap diambil" ? "green" : "orange"}`}>{order.fulfillmentStatus}</em></div>)}{pickupsToday.length === 0 && <div className="empty-state"><p>Belum ada jadwal pengambilan hari ini.</p></div>}</div></article>
        <article className="admin-panel stock-panel"><div className="panel-heading"><h2>Stok hampir habis</h2><Link href="/admin/inventory">Kelola stok</Link></div>{lowStock.map((product) => <div className="stock-row" key={product.id}><span>{product.name}</span><small>{product.category}</small><strong>{product.stock}</strong></div>)}{lowStock.length === 0 && <div className="empty-state"><p>Tidak ada stok yang menipis.</p></div>}</article>
      </section>
    </main>
  );
}
