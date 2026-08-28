"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { formatRupiah } from "../../../lib/data";

type ProductRow = { id: string; name: string; code?: string; kind: string; category: string; species?: string; breed?: string; sex?: string; age?: string; price: number; stock: number; health: string; status: string; image: string; temperament?: string; description: string; featured: boolean; updatedAt: string; };

export function InventoryClient() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [tab, setTab] = useState<"animal" | "supply">("animal");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ProductRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const load = () => fetch("/api/products").then((r) => r.json() as Promise<{ products?: ProductRow[] }>).then((data) => setRows(data.products || [])).catch(() => setRows([]));
  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => rows.filter((row) => row.kind === tab && `${row.name} ${row.code} ${row.breed} ${row.category}`.toLowerCase().includes(query.toLowerCase())), [query, rows, tab]);
  const counts = { available: rows.filter((row) => row.status === "Tersedia").length, reserved: rows.filter((row) => row.status === "Direservasi").length, low: rows.filter((row) => row.status === "Stok menipis").length };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const body = { ...data, kind: tab, category: tab === "animal" ? String(data.species || "Hamster") : String(data.category || "Perlengkapan"), price: Number(data.price), stock: Number(data.stock), featured: data.featured === "on" };
    await fetch(creating ? "/api/products" : `/api/products/${selected?.id}`, { method: creating ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    await load();
    setSaving(false); setSelected(null); setCreating(false);
  };

  const beginCreate = () => {
    setCreating(true);
    setSelected({ id:"", name:"", kind:tab, category: tab === "animal" ? "Hamster" : "Pakan & Hay", price:0, stock: tab === "animal" ? 1 : 0, health:"Sehat", status:"Tersedia", image:"", description:"", featured:false, updatedAt:"" });
  };

  return (
    <main className="admin-content inventory-page">
      <div className="admin-page-title"><div><p>KATALOG & STOK</p><h1>Hewan & Produk</h1></div><button className="admin-primary" onClick={beginCreate}>+ Tambah Baru</button></div>
      <div className="admin-segments"><button className={tab === "animal" ? "active" : ""} onClick={() => setTab("animal")}>Hewan Hidup</button><button className={tab === "supply" ? "active" : ""} onClick={() => setTab("supply")}>Perlengkapan</button><button>Kategori</button><button>Stok</button></div>
      <div className="admin-toolbar"><label><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Cari ${tab === "animal" ? "hewan" : "produk"}…`} /></label><select><option>Semua status</option><option>Tersedia</option><option>Direservasi</option></select><button>⇧ Impor</button><button>⇩ Ekspor</button></div>
      <div className="inventory-counts"><span>Total {filtered.length} item</span><em className="status-chip green">Tersedia {counts.available}</em><em className="status-chip orange">Direservasi {counts.reserved}</em><em className="status-chip red">Stok tipis {counts.low}</em></div>
      <section className="admin-panel inventory-table-wrap"><div className="admin-table inventory-table"><div className="table-head"><span>Nama / Kode</span><span>Jenis / Kategori</span><span>{tab === "animal" ? "Sex / Usia" : "Stok"}</span><span>Harga</span><span>Kesehatan</span><span>Status</span><span>Terakhir diubah</span><span /></div>{filtered.map((row) => <button className="table-row" key={row.id} onClick={() => { setCreating(false); setSelected(row); }}>{/* eslint-disable-next-line @next/next/no-img-element */}<span className="admin-product-name"><img src={row.image} alt=""/><b>{row.name}<small>{row.code || row.id}</small></b></span><span>{row.breed || row.category}</span><span>{tab === "animal" ? `${row.sex || "—"} / ${row.age || "—"}` : `${row.stock} unit`}</span><strong>{formatRupiah(row.price)}</strong><em className={`status-chip ${row.health === "Sehat" ? "green" : "red"}`}>{row.health}</em><em className={`status-chip ${row.status === "Tersedia" ? "green" : row.status === "Direservasi" ? "orange" : "red"}`}>{row.status}</em><span>{row.updatedAt?.slice(0,10) || "Hari ini"}</span><b>⋯</b></button>)}</div></section>
      {selected && <div className="admin-drawer-backdrop" onMouseDown={() => setSelected(null)}><aside className="admin-drawer" onMouseDown={(event) => event.stopPropagation()}><div className="drawer-heading"><h2>{creating ? "Tambah item" : `${selected.name} / ${selected.code || selected.id}`}</h2><button onClick={() => setSelected(null)}>×</button></div><form onSubmit={save}><label>Foto utama<div className="drawer-photo">{selected.image ? <>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={selected.image} alt={selected.name} /></> : <span>Unggah foto asli</span>}</div><input name="image" defaultValue={selected.image} placeholder="URL foto" /></label><div className="drawer-form-row"><label>Nama<input name="name" required defaultValue={selected.name}/></label><label>Kode<input name="code" defaultValue={selected.code}/></label></div><div className="drawer-form-row"><label>Jenis / Kategori<select name={tab === "animal" ? "species" : "category"} defaultValue={selected.species || selected.category}><option>Hamster</option><option>Kelinci</option>{tab === "supply" && <><option>Pakan & Hay</option><option>Habitat & Kandang</option><option>Alas & Litter</option><option>Mainan & Enrichment</option><option>Carrier</option></>}</select></label><label>Ras<input name="breed" defaultValue={selected.breed}/></label></div><div className="drawer-form-row"><label>Harga<input name="price" type="number" defaultValue={selected.price}/></label><label>Stok<input name="stock" type="number" defaultValue={selected.stock}/></label></div><div className="drawer-form-row"><label>Status<select name="status" defaultValue={selected.status}><option>Tersedia</option><option>Direservasi</option><option>Terjual</option><option>Stok menipis</option></select></label><label>Kesehatan<select name="health" defaultValue={selected.health}><option>Sehat</option><option>Perlu diperiksa</option></select></label></div><label>Deskripsi<textarea name="description" rows={4} defaultValue={selected.description}/></label><label className="drawer-check"><input type="checkbox" name="featured" defaultChecked={selected.featured}/><span>Tampilkan di halaman utama</span></label><div className="drawer-actions"><button type="button" onClick={() => setSelected(null)}>Batal</button><button className="admin-primary" disabled={saving}>{saving ? "Menyimpan…" : "Simpan Perubahan"}</button></div></form></aside></div>}
    </main>
  );
}
