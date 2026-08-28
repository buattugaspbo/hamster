"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatRupiah } from "../../lib/data";

type ProductRow = { id: string; name: string; category: string; stock: number; status: string; image: string; kind: string; };
type OrderRow = { id: string; customerName: string; itemName: string; total: number; paymentStatus: string; fulfillmentStatus: string; pickupAt?: string; type: string; };

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
  const chart = [42, 49, 38, 58, 62, 47, 73, 66, 55, 76, 83, 71, 64, 88, 79, 92, 84, 98, 86, 109, 95, 118, 102, 126];
  const points = chart.map((value, index) => `${(index / (chart.length - 1)) * 100},${120 - value * .72}`).join(" ");

  return (
    <main className="admin-content">
      <div className="admin-page-title"><div><p>OPERASIONAL TOKO</p><h1>Ringkasan Toko</h1></div><span className={offline ? "sync-badge sync-badge--warn" : "sync-badge"}>{offline ? "Data contoh" : "Data tersinkron"}</span></div>
      <section className="admin-kpis">
        <article><i>Rp</i><div><span>Penjualan tercatat</span><strong>{formatRupiah(revenue || 42850000)}</strong><small>↑ 18,6% dari bulan lalu</small></div></article>
        <article><i>↗</i><div><span>Pesanan baru</span><strong>{orders.length || 28}</strong><small>Perlu ditindaklanjuti</small></div></article>
        <article><i>◇</i><div><span>Reservasi aktif</span><strong>{reservations.length || 14}</strong><small>Jadwal pengambilan</small></div></article>
        <article><i>!</i><div><span>Stok menipis</span><strong>{lowStock.length || 12}</strong><small>Periksa daftar stok</small></div></article>
      </section>
      <section className="admin-dashboard-grid">
        <article className="admin-panel admin-chart-panel">
          <div className="panel-heading"><div><h2>Penjualan 30 hari terakhir</h2><span>Total transaksi tercatat</span></div><select><option>30 hari terakhir</option></select></div>
          <div className="chart-wrap"><div className="chart-axis"><span>5 jt</span><span>4 jt</span><span>3 jt</span><span>2 jt</span><span>1 jt</span></div><svg viewBox="0 0 100 125" preserveAspectRatio="none" aria-label="Grafik penjualan"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#315f44" stopOpacity=".22"/><stop offset="1" stopColor="#315f44" stopOpacity="0"/></linearGradient></defs><polygon points={`0,125 ${points} 100,125`} fill="url(#area)"/><polyline points={points} fill="none" stroke="#315f44" strokeWidth="1.2" vectorEffect="non-scaling-stroke"/></svg></div>
        </article>
        <article className="admin-panel attention-panel"><div className="panel-heading"><h2>Perlu ditangani</h2></div><Link href="/admin/orders"><i>8</i><div><strong>Pesanan menunggu konfirmasi</strong><span>Periksa data pembeli dan stok</span></div><b>→</b></Link><Link href="/admin/orders"><i>5</i><div><strong>Reservasi perlu konfirmasi</strong><span>Hubungi calon pemilik</span></div><b>→</b></Link><Link href="/admin/inventory"><i>{lowStock.length || 12}</i><div><strong>Stok hampir habis</strong><span>Produk di bawah batas minimum</span></div><b>→</b></Link></article>
        <article className="admin-panel pickup-panel"><div className="panel-heading"><h2>Pengambilan hari ini</h2><Link href="/admin/orders">Lihat semua</Link></div><div className="admin-table mini-table"><div className="table-head"><span>Waktu</span><span>Pelanggan</span><span>Item</span><span>Status</span></div>{(orders.length ? orders : [{id:"1",customerName:"Rina Wulandari",itemName:"Luna · Kelinci",fulfillmentStatus:"Perlu dikonfirmasi",pickupAt:"10:00",total:0,paymentStatus:"",type:""},{id:"2",customerName:"Dika Pratama",itemName:"Mochi · Hamster",fulfillmentStatus:"Siap diambil",pickupAt:"13:00",total:0,paymentStatus:"",type:""}]).slice(0,5).map((order) => <div className="table-row" key={order.id}><span>{order.pickupAt?.split("·").pop() || "10:00"}</span><strong>{order.customerName}</strong><span>{order.itemName}</span><em className={`status-chip ${order.fulfillmentStatus === "Siap diambil" ? "green" : "orange"}`}>{order.fulfillmentStatus}</em></div>)}</div></article>
        <article className="admin-panel stock-panel"><div className="panel-heading"><h2>Stok hampir habis</h2><Link href="/admin/inventory">Kelola stok</Link></div>{(lowStock.length ? lowStock : [{id:"p4",name:"Timothy Hay Premium",category:"Pakan & Hay",stock:3,status:"Stok menipis",image:"",kind:"supply"},{id:"p8",name:"Pet Carrier Medium",category:"Carrier",stock:2,status:"Stok menipis",image:"",kind:"supply"}]).map((product) => <div className="stock-row" key={product.id}><span>{product.name}</span><small>{product.category}</small><strong>{product.stock}</strong></div>)}</article>
      </section>
    </main>
  );
}
