"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { formatRupiah } from "../../../lib/data";
import { getSupplierLink } from "../../../lib/supplier-links";

type ProductRow = {
  id: string; name: string; code?: string; kind: "animal" | "supply"; category: string;
  species?: string; breed?: string; sex?: string; age?: string; price: number; stock: number;
  health: string; status: string; image: string; temperament?: string; description: string;
  featured: boolean; dimensions?: string; weightGrams?: number; updatedAt?: string;
};

const supplyCategories = ["Pakan & Hay", "Habitat & Kandang", "Alas & Litter", "Mainan & Enrichment", "Tempat Makan & Minum", "Perawatan & Grooming", "Carrier & Perjalanan", "Starter Kit"];
const statuses = ["Tersedia", "Direservasi", "Terjual", "Stok menipis", "Stok habis"];

function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function InventoryClient() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [tab, setTab] = useState<"animal" | "supply">("animal");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [selected, setSelected] = useState<ProductRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      const payload = await response.json() as { products?: ProductRow[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "Katalog gagal dimuat");
      setRows(payload.products || []); setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Katalog gagal dimuat");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void load(); });
    return () => window.cancelAnimationFrame(frame);
  }, [load]);

  const tabRows = useMemo(() => rows.filter((row) => row.kind === tab), [rows, tab]);
  const filtered = useMemo(() => tabRows.filter((row) => {
    const matchesQuery = `${row.name} ${row.code} ${row.breed} ${row.category}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (statusFilter === "Semua" || row.status === statusFilter);
  }), [query, statusFilter, tabRows]);
  const counts = {
    available: tabRows.filter((row) => row.status === "Tersedia").length,
    reserved: tabRows.filter((row) => row.status === "Direservasi").length,
    low: tabRows.filter((row) => row.status === "Stok menipis" || row.status === "Stok habis").length,
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const data = Object.fromEntries(new FormData(event.currentTarget));
      const body = {
        ...data,
        kind: tab,
        category: tab === "animal" ? String(data.species || "Hamster") : String(data.category),
        price: Number(data.price), stock: Number(data.stock), featured: data.featured === "on",
        weightGrams: data.weightGrams ? Number(data.weightGrams) : null,
      };
      const response = await fetch(creating ? "/api/products" : `/api/products/${selected?.id}`, {
        method: creating ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Item gagal disimpan");
      await load(); setSelected(null); setCreating(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Item gagal disimpan");
    } finally {
      setSaving(false);
    }
  };

  const beginCreate = () => {
    setCreating(true); setError("");
    setSelected({ id: "", name: "", kind: tab, category: tab === "animal" ? "Hamster" : "Pakan & Hay", price: 0, stock: tab === "animal" ? 1 : 0, health: "Sehat", status: "Tersedia", image: "", description: "", featured: false });
  };

  const remove = async () => {
    if (!selected?.id || !window.confirm(`Hapus ${selected.name} dari katalog?`)) return;
    setSaving(true); setError("");
    try {
      const response = await fetch(`/api/products/${selected.id}`, { method: "DELETE" });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Item gagal dihapus");
      setSelected(null); await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Item gagal dihapus");
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = () => {
    const data = [
      ["ID", "Nama", "Kode", "Jenis", "Kategori/Ras", "Harga", "Stok", "Status", "Kesehatan"],
      ...filtered.map((row) => [row.id, row.name, row.code, row.kind, row.breed || row.category, row.price, row.stock, row.status, row.health]),
    ];
    const url = URL.createObjectURL(new Blob([`\uFEFF${data.map((row) => row.map(csvCell).join(",")).join("\r\n")}`], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `katalog-${tab}-${new Date().toISOString().slice(0, 10)}.csv`; anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="admin-content inventory-page">
      <div className="admin-page-title"><div><p>KATALOG & STOK</p><h1>Hewan & produk</h1></div><button className="admin-primary" onClick={beginCreate}>+ Tambah item</button></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="admin-segments"><button className={tab === "animal" ? "active" : ""} onClick={() => { setTab("animal"); setStatusFilter("Semua"); }}>Hewan</button><button className={tab === "supply" ? "active" : ""} onClick={() => { setTab("supply"); setStatusFilter("Semua"); }}>Perlengkapan</button></div>
      <div className="admin-toolbar"><label><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Cari ${tab === "animal" ? "hewan" : "produk"}…`} /></label><select aria-label="Filter status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>Semua</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select><button onClick={exportCsv} disabled={filtered.length === 0}>⇩ Ekspor CSV</button></div>
      <div className="inventory-counts"><span>Total {filtered.length} item</span><em className="status-chip green">Tersedia {counts.available}</em><em className="status-chip orange">Direservasi {counts.reserved}</em><em className="status-chip red">Stok tipis/habis {counts.low}</em></div>
      <section className="admin-panel inventory-table-wrap"><div className="admin-table inventory-table"><div className="table-head"><span>Nama / Kode</span><span>Jenis / Kategori</span><span>{tab === "animal" ? "Kelamin / Usia" : "Stok"}</span><span>Harga</span><span>Kesehatan</span><span>Status</span><span>Terakhir diubah</span><span /></div>{filtered.map((row) => <button className="table-row" key={row.id} onClick={() => { setCreating(false); setSelected(row); setError(""); }}>{/* eslint-disable-next-line @next/next/no-img-element */}<span className="admin-product-name"><img src={row.image} alt=""/><b>{row.name}<small>{row.code || row.id}</small></b></span><span>{row.breed || row.category}</span><span>{tab === "animal" ? `${row.sex || "—"} / ${row.age || "—"}` : `${row.stock} unit`}</span><strong>{formatRupiah(row.price)}</strong><em className={`status-chip ${row.health === "Sehat" ? "green" : "red"}`}>{row.health}</em><em className={`status-chip ${row.status === "Tersedia" ? "green" : row.status === "Direservasi" || row.status === "Stok menipis" ? "orange" : "red"}`}>{row.status}</em><span>{row.updatedAt?.slice(0, 10) || "—"}</span><b>⋯</b></button>)}{!loading && filtered.length === 0 && <div className="empty-state"><p>Tidak ada item yang cocok dengan filter ini.</p></div>}</div></section>
      {selected && <div className="admin-drawer-backdrop" onMouseDown={() => setSelected(null)}><aside className="admin-drawer" onMouseDown={(event) => event.stopPropagation()}><div className="drawer-heading"><h2>{creating ? "Tambah item" : `${selected.name} / ${selected.code || selected.id}`}</h2><button onClick={() => setSelected(null)}>×</button></div><form onSubmit={save}><label>Foto utama<div className="drawer-photo">{selected.image ? <>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={selected.image} alt={selected.name} /></> : <span>Masukkan URL foto</span>}</div><input name="image" type="url" required defaultValue={selected.image} placeholder="https://…" /></label>{getSupplierLink(selected.id) && <div className="supplier-reference"><strong>Referensi supplier</strong><span>{getSupplierLink(selected.id)?.marketplace} · dicek {getSupplierLink(selected.id)?.checkedAt}</span><b>Harga acuan {formatRupiah(getSupplierLink(selected.id)?.sourcePrice || 0)}</b><small>{getSupplierLink(selected.id)?.sourceTitle}</small><a href={getSupplierLink(selected.id)?.url} target="_blank" rel="noreferrer">Buka listing supplier ↗</a><em>Harga dan stok supplier bisa berubah. Cek variasi sebelum membeli.</em></div>}<div className="drawer-form-row"><label>Nama<input name="name" required defaultValue={selected.name}/></label><label>Kode<input name="code" defaultValue={selected.code}/></label></div>{tab === "animal" ? <div className="drawer-form-row"><label>Jenis<select name="species" defaultValue={selected.species || selected.category}><option>Hamster</option><option>Kelinci</option></select></label><label>Ras<input name="breed" required defaultValue={selected.breed}/></label></div> : <div className="drawer-form-row"><label>Kategori<select name="category" defaultValue={selected.category}>{supplyCategories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Ukuran<input name="dimensions" defaultValue={selected.dimensions}/></label></div>}<div className="drawer-form-row"><label>Harga<input name="price" required min="0" type="number" defaultValue={selected.price}/></label><label>Stok<input name="stock" required min="0" type="number" defaultValue={selected.stock}/></label></div><div className="drawer-form-row"><label>Status<select name="status" defaultValue={selected.status}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label><label>Kesehatan<select name="health" defaultValue={selected.health}><option>Sehat</option><option>Perlu diperiksa</option></select></label></div>{tab === "animal" && <><div className="drawer-form-row"><label>Jenis kelamin<select name="sex" defaultValue={selected.sex || ""}><option value="">Pilih</option><option>Jantan</option><option>Betina</option></select></label><label>Usia<input name="age" defaultValue={selected.age}/></label></div><label>Karakter<input name="temperament" defaultValue={selected.temperament}/></label></>}<label>Deskripsi<textarea name="description" rows={4} defaultValue={selected.description}/></label><label className="drawer-check"><input type="checkbox" name="featured" defaultChecked={selected.featured}/><span>Tampilkan di halaman utama</span></label><div className="drawer-actions">{!creating && <button className="danger" type="button" disabled={saving} onClick={() => void remove()}>Hapus</button>}<button type="button" onClick={() => setSelected(null)}>Batal</button><button className="admin-primary" disabled={saving}>{saving ? "Menyimpan…" : "Simpan"}</button></div></form></aside></div>}
    </main>
  );
}
