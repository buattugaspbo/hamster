"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatRupiah } from "../../../lib/data";

type OrderRow = {
  id: string; customerName: string; phone: string; email?: string; type: string;
  itemName: string; total: number; paymentStatus: string; fulfillmentStatus: string;
  pickupAt?: string; notes?: string; createdAt?: string;
};

const tabs = [
  { value: "Semua", label: "Semua" },
  { value: "Perlu dikonfirmasi", label: "Perlu konfirmasi" },
  { value: "Menunggu verifikasi", label: "Cek pembayaran" },
  { value: "Dibayar", label: "Dibayar" },
  { value: "Siap diambil", label: "Siap diambil" },
  { value: "Selesai", label: "Selesai" },
  { value: "Dibatalkan", label: "Dibatalkan" },
];

function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function whatsappUrl(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits.startsWith("0") ? `62${digits.slice(1)}` : digits}`;
}

function formatSchedule(value?: string) {
  if (!value) return "Belum dipilih";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(value));
}

export function OrdersClient() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [selected, setSelected] = useState<OrderRow | null>(null);
  const [tab, setTab] = useState("Semua");
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/orders", { cache: "no-store" });
      const payload = await response.json() as { orders?: OrderRow[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "Pesanan gagal dimuat");
      setOrders(payload.orders || []); setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Pesanan gagal dimuat");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void load(); });
    return () => window.cancelAnimationFrame(frame);
  }, [load]);

  const filtered = useMemo(() => orders.filter((order) => {
    const matchesQuery = `${order.id} ${order.customerName} ${order.itemName}`.toLowerCase().includes(query.toLowerCase());
    const matchesTab = tab === "Semua" || order.paymentStatus === tab || order.fulfillmentStatus === tab;
    const matchesDate = !date || order.createdAt?.slice(0, 10) === date;
    return matchesQuery && matchesTab && matchesDate;
  }), [date, orders, query, tab]);

  const count = (value: string) => orders.filter((order) => order.paymentStatus === value || order.fulfillmentStatus === value).length;

  const patchOrder = async (id: string, patch: Partial<OrderRow>) => {
    setSaving(true); setError("");
    try {
      const response = await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
      const payload = await response.json() as { order?: OrderRow; error?: string };
      if (!response.ok || !payload.order) throw new Error(payload.error || "Pesanan gagal diperbarui");
      setSelected(payload.order); await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Pesanan gagal diperbarui");
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = () => {
    const rows = [
      ["ID", "Tanggal", "Pelanggan", "WhatsApp", "Item", "Total", "Pembayaran", "Pemenuhan", "Jadwal"],
      ...filtered.map((order) => [order.id, order.createdAt, order.customerName, order.phone, order.itemName, order.total, order.paymentStatus, order.fulfillmentStatus, order.pickupAt]),
    ];
    const url = URL.createObjectURL(new Blob([`\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `pesanan-hop-and-ham-${new Date().toISOString().slice(0, 10)}.csv`; anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="admin-content orders-page">
      <div className="admin-page-title"><div><p>TRANSAKSI</p><h1>Pesanan & reservasi</h1></div></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <section className="order-counters">{tabs.map(({ value, label }) => <button key={value} className={tab === value ? "active" : ""} onClick={() => setTab(value)}><span>{label}</span><strong>{value === "Semua" ? orders.length : count(value)}</strong></button>)}</section>
      <div className="admin-toolbar"><label><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari ID, nama, atau item…" /></label><input aria-label="Filter tanggal" type="date" value={date} onChange={(event) => setDate(event.target.value)} /><button onClick={exportCsv} disabled={filtered.length === 0}>⇩ Ekspor CSV</button></div>
      <section className="admin-panel orders-table-wrap"><div className="admin-table orders-table"><div className="table-head"><span>ID Pesanan</span><span>Pelanggan</span><span>Item</span><span>Total</span><span>Pembayaran</span><span>Pemenuhan</span><span>Jadwal ambil</span><span /></div>{filtered.map((order) => <button className="table-row" key={order.id} onClick={() => setSelected(order)}><span><b>{order.id}</b><small>{order.type === "reservation" ? "Reservasi hewan" : "Pesanan"}</small></span><span><b>{order.customerName}</b><small>{order.phone}</small></span><span>{order.itemName}</span><strong>{formatRupiah(order.total)}</strong><em className={`status-chip ${order.paymentStatus === "Dibayar" ? "green" : order.paymentStatus === "Dikembalikan" ? "red" : "orange"}`}>{order.paymentStatus}</em><em className={`status-chip ${order.fulfillmentStatus === "Selesai" || order.fulfillmentStatus === "Siap diambil" ? "green" : order.fulfillmentStatus === "Dibatalkan" ? "red" : "orange"}`}>{order.fulfillmentStatus}</em><span>{formatSchedule(order.pickupAt)}</span><b>⋯</b></button>)}{!loading && filtered.length === 0 && <div className="empty-state"><p>Tidak ada pesanan yang cocok dengan filter ini.</p></div>}</div></section>
      {selected && <div className="admin-drawer-backdrop" onMouseDown={() => setSelected(null)}><aside className="admin-drawer order-drawer" onMouseDown={(event) => event.stopPropagation()}><div className="drawer-heading"><div><h2>{selected.id}</h2><em className="status-chip orange">{selected.type === "reservation" ? "Reservasi hewan" : "Pesanan"}</em></div><button onClick={() => setSelected(null)}>×</button></div><section><h3>Pelanggan</h3><strong>{selected.customerName}</strong><p>{selected.phone}</p><p>{selected.email || "Email tidak dicantumkan"}</p></section><section><h3>Item</h3><div className="order-item-highlight"><span>{selected.itemName}</span><strong>{formatRupiah(selected.total)}</strong></div></section><section><h3>Jadwal</h3><p>{formatSchedule(selected.pickupAt)}</p></section><div className="order-actions">{selected.paymentStatus !== "Dibayar" && selected.fulfillmentStatus !== "Dibatalkan" && <button disabled={saving} className="admin-primary" onClick={() => patchOrder(selected.id, { paymentStatus: "Dibayar", fulfillmentStatus: "Diproses" })}>Konfirmasi pembayaran</button>}{selected.paymentStatus === "Dibayar" && selected.fulfillmentStatus === "Diproses" && <button disabled={saving} className="admin-primary" onClick={() => patchOrder(selected.id, { fulfillmentStatus: "Siap diambil" })}>Tandai siap diambil</button>}{selected.fulfillmentStatus === "Siap diambil" && <button disabled={saving} className="admin-primary" onClick={() => patchOrder(selected.id, { fulfillmentStatus: "Selesai" })}>Tandai selesai</button>}<a href={whatsappUrl(selected.phone)} target="_blank" rel="noreferrer">Kirim WhatsApp</a>{!["Dibatalkan", "Selesai"].includes(selected.fulfillmentStatus) && <button disabled={saving} className="danger" onClick={() => { if (window.confirm("Batalkan pesanan ini dan kembalikan stok?")) void patchOrder(selected.id, { fulfillmentStatus: "Dibatalkan" }); }}>Batalkan pesanan</button>}</div></aside></div>}
    </main>
  );
}
