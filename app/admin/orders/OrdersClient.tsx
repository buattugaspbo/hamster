"use client";

import { useEffect, useMemo, useState } from "react";
import { formatRupiah } from "../../../lib/data";

type OrderRow = { id: string; customerName: string; phone: string; email?: string; type: string; itemName: string; total: number; paymentStatus: string; fulfillmentStatus: string; pickupAt?: string; notes?: string; createdAt: string; };

export function OrdersClient() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [selected, setSelected] = useState<OrderRow | null>(null);
  const [tab, setTab] = useState("Semua");
  const [query, setQuery] = useState("");
  const load = () => fetch("/api/orders").then((r) => r.json() as Promise<{ orders?: OrderRow[] }>).then((data) => setOrders(data.orders || [])).catch(() => setOrders([]));
  useEffect(() => {
    void load();
  }, []);
  const filtered = useMemo(() => orders.filter((order) => `${order.id} ${order.customerName} ${order.itemName}`.toLowerCase().includes(query.toLowerCase()) && (tab === "Semua" || order.paymentStatus === tab || order.fulfillmentStatus === tab)), [orders, query, tab]);
  const count = (value: string) => orders.filter((order) => order.paymentStatus === value || order.fulfillmentStatus === value).length;
  const patchOrder = async (id: string, patch: Partial<OrderRow>) => { await fetch(`/api/orders/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(patch) }); await load(); setSelected((current) => current ? {...current, ...patch} : current); };

  return (
    <main className="admin-content orders-page">
      <div className="admin-page-title"><div><p>TRANSAKSI</p><h1>Pesanan & Reservasi</h1></div><button className="admin-primary">+ Pesanan Manual</button></div>
      <section className="order-counters">{[["Semua",orders.length],["Perlu Konfirmasi",count("Perlu dikonfirmasi")],["Dibayar",count("Dibayar")],["Siap Diambil",count("Siap diambil")],["Selesai",count("Selesai")],["Dibatalkan",count("Dibatalkan")]].map(([label,value]) => <button key={String(label)} className={tab === label ? "active" : ""} onClick={() => setTab(String(label))}><span>{label}</span><strong>{value || 0}</strong></button>)}</section>
      <div className="admin-toolbar"><label><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari ID, nama, atau item…" /></label><input type="date"/><button>⇩ Ekspor</button></div>
      <section className="admin-panel orders-table-wrap"><div className="admin-table orders-table"><div className="table-head"><span>ID Pesanan</span><span>Pelanggan</span><span>Item</span><span>Total</span><span>Pembayaran</span><span>Pemenuhan</span><span>Jadwal ambil</span><span /></div>{filtered.map((order) => <button className="table-row" key={order.id} onClick={() => setSelected(order)}><span><b>{order.id}</b><small>{order.type === "reservation" ? "Reservasi Hewan" : "Pesanan"}</small></span><span><b>{order.customerName}</b><small>{order.phone}</small></span><span>{order.itemName}</span><strong>{formatRupiah(order.total)}</strong><em className={`status-chip ${order.paymentStatus === "Dibayar" ? "green" : order.paymentStatus === "Dikembalikan" ? "red" : "orange"}`}>{order.paymentStatus}</em><em className={`status-chip ${order.fulfillmentStatus === "Selesai" || order.fulfillmentStatus === "Siap diambil" ? "green" : "orange"}`}>{order.fulfillmentStatus}</em><span>{order.pickupAt || "Belum dipilih"}</span><b>⋯</b></button>)}</div></section>
      {selected && <div className="admin-drawer-backdrop" onMouseDown={() => setSelected(null)}><aside className="admin-drawer order-drawer" onMouseDown={(event) => event.stopPropagation()}><div className="drawer-heading"><div><h2>{selected.id}</h2><em className="status-chip orange">{selected.type === "reservation" ? "Reservasi Hewan" : "Pesanan"}</em></div><button onClick={() => setSelected(null)}>×</button></div><section><h3>Pelanggan</h3><strong>{selected.customerName}</strong><p>{selected.phone}</p><p>{selected.email || "Email tidak dicantumkan"}</p></section><section><h3>Item</h3><div className="order-item-highlight"><span>{selected.itemName}</span><strong>{formatRupiah(selected.total)}</strong></div></section><section><h3>Jadwal ambil</h3><p>{selected.pickupAt || "Belum dipilih"}</p></section><section><h3>Checklist internal</h3><label className="drawer-check"><input type="checkbox"/><span>Hubungi pembeli</span></label><label className="drawer-check"><input type="checkbox"/><span>Siapkan carrier / barang</span></label><label className="drawer-check"><input type="checkbox"/><span>Pemeriksaan akhir</span></label></section><div className="order-actions"><button className="admin-primary" onClick={() => patchOrder(selected.id,{paymentStatus:"Dibayar",fulfillmentStatus:"Siap diambil"})}>Konfirmasi Pesanan</button><a href={`https://wa.me/${selected.phone.replace(/\D/g,"")}`}>Kirim WhatsApp</a><button className="danger" onClick={() => patchOrder(selected.id,{fulfillmentStatus:"Dibatalkan"})}>Batalkan</button></div></aside></div>}
    </main>
  );
}
