"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ProductCard } from "../../components/ProductCard";
import type { CatalogItem } from "../../lib/data";

const animalBreeds = ["Syrian", "Campbell", "Winter White", "Roborovski", "Holland Lop", "Netherland Dwarf", "Mini Rex", "Lionhead"];
const supplyCategories = ["Habitat & Kandang", "Pakan & Hay", "Alas & Litter", "Mainan & Enrichment", "Tempat Makan & Minum", "Perawatan & Grooming", "Carrier & Perjalanan", "Starter Kit"];

export function ShopClient({ items }: { items: CatalogItem[] }) {
  const searchParams = useSearchParams();
  const initial = searchParams.get("type") || "Semua";
  const [type, setType] = useState(initial);
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const typeMatch =
        type === "Semua" ||
        (type === "Perlengkapan" ? item.kind === "supply" : item.species === type);
      const queryMatch = `${item.name} ${item.breed || ""} ${item.category}`.toLowerCase().includes(query.toLowerCase());
      const facetMatch = selected.length === 0 || selected.includes(item.breed || item.category);
      return typeMatch && queryMatch && facetMatch;
    });
  }, [items, query, selected, type]);

  const facets = type === "Perlengkapan" ? supplyCategories : animalBreeds;

  const toggleFacet = (facet: string) => {
    setSelected((current) => current.includes(facet) ? current.filter((item) => item !== facet) : [...current, facet]);
  };

  return (
    <div className="shop-layout content-shell">
      <div className="shop-title-row">
        <div>
          <p className="eyebrow">STOK DIPERBARUI SETIAP HARI</p>
          <h1>{type === "Perlengkapan" ? "Perlengkapan yang tepat" : "Hewan yang tersedia"}</h1>
          <p>{filtered.length} item tersedia di toko Palembang</p>
        </div>
        <label className="search-field">
          <span>⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, jenis, atau produk" />
        </label>
      </div>

      <div className="shop-tabs" role="tablist" aria-label="Kategori toko">
        {["Semua", "Hamster", "Kelinci", "Perlengkapan"].map((tab) => (
          <button key={tab} className={type === tab ? "active" : ""} onClick={() => { setType(tab); setSelected([]); }}>{tab}</button>
        ))}
      </div>

      <button className="mobile-filter-button" onClick={() => setFiltersOpen((value) => !value)}>Filter & jenis</button>
      <div className="catalog-area">
        <aside className={filtersOpen ? "filters-open" : ""}>
          <div className="filter-heading"><strong>Filter</strong><button onClick={() => setSelected([])}>Reset</button></div>
          <fieldset>
            <legend>{type === "Perlengkapan" ? "Kategori" : "Jenis / ras"}</legend>
            {facets.map((facet) => (
              <label key={facet}>
                <input type="checkbox" checked={selected.includes(facet)} onChange={() => toggleFacet(facet)} />
                <span>{facet}</span>
              </label>
            ))}
          </fieldset>
          {type !== "Perlengkapan" && (
            <>
              <fieldset>
                <legend>Jenis kelamin</legend>
                <label><input type="checkbox" /><span>Jantan</span></label>
                <label><input type="checkbox" /><span>Betina</span></label>
              </fieldset>
              <fieldset>
                <legend>Karakter</legend>
                <label><input type="checkbox" /><span>Tenang</span></label>
                <label><input type="checkbox" /><span>Aktif</span></label>
                <label><input type="checkbox" /><span>Ramah</span></label>
              </fieldset>
            </>
          )}
        </aside>
        <section className="catalog-results">
          <div className="catalog-toolbar"><span>{filtered.length} hasil</span><select aria-label="Urutkan"><option>Terbaru</option><option>Harga terendah</option><option>Harga tertinggi</option></select></div>
          {filtered.length > 0 ? (
            <div className="catalog-grid">{filtered.map((item) => <ProductCard item={item} key={item.id} />)}</div>
          ) : (
            <div className="empty-state"><h2>Belum ada hasil yang cocok.</h2><p>Coba hapus filter atau gunakan kata pencarian lain.</p><button onClick={() => { setSelected([]); setQuery(""); }}>Tampilkan semua</button></div>
          )}
        </section>
      </div>
    </div>
  );
}
