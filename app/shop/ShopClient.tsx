"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { ProductCard } from "../../components/ProductCard";
import type { CatalogItem } from "../../lib/data";

const animalBreeds = ["Syrian", "Syrian Long Hair", "Campbell", "Winter White", "Roborovski", "Holland Lop", "Netherland Dwarf", "Mini Rex", "Lionhead"];
const supplyCategories = ["Habitat & Kandang", "Pakan & Hay", "Alas & Litter", "Mainan & Enrichment", "Tempat Makan & Minum", "Perawatan & Grooming", "Carrier & Perjalanan", "Starter Kit"];

export function ShopClient({ items }: { items: CatalogItem[] }) {
  const searchParams = useSearchParams();
  const initial = searchParams.get("type") || "Semua";
  const [type, setType] = useState(initial);
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [sexes, setSexes] = useState<string[]>([]);
  const [temperaments, setTemperaments] = useState<string[]>([]);
  const [sort, setSort] = useState("recommended");
  const isSupplyView = type === "Perlengkapan";

  const filtered = useMemo(() => {
    const matchingItems = items.filter((item) => {
      const typeMatch =
        type === "Semua" ||
        (isSupplyView ? item.kind === "supply" : item.species === type);
      const queryMatch = `${item.name} ${item.breed || ""} ${item.category}`.toLowerCase().includes(query.toLowerCase());
      const facetMatch = selected.length === 0 || selected.includes(item.breed || item.category);
      const sexMatch = sexes.length === 0 || (item.sex ? sexes.includes(item.sex) : true);
      const temperamentMatch = temperaments.length === 0 || (item.temperament ? temperaments.some((temperament) => item.temperament?.toLowerCase().includes(temperament.toLowerCase())) : true);
      return typeMatch && queryMatch && facetMatch && sexMatch && temperamentMatch;
    });
    return [...matchingItems].sort((left, right) => {
      if (sort === "low") return left.price - right.price;
      if (sort === "high") return right.price - left.price;
      if (sort === "available") return Number(left.status !== "Tersedia") - Number(right.status !== "Tersedia");
      return Number(right.featured) - Number(left.featured) || left.name.localeCompare(right.name, "id");
    });
  }, [isSupplyView, items, query, selected, sexes, sort, temperaments, type]);

  const facets = isSupplyView ? supplyCategories : animalBreeds;

  const toggleFacet = (facet: string) => {
    setSelected((current) => current.includes(facet) ? current.filter((item) => item !== facet) : [...current, facet]);
  };

  const toggleValue = (value: string, setter: Dispatch<SetStateAction<string[]>>) => {
    setter((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const clearFilters = () => {
    setSelected([]); setSexes([]); setTemperaments([]); setQuery("");
  };

  return (
    <div className="shop-layout content-shell">
      <div className="shop-title-row">
        <div>
          <p className="eyebrow">KATALOG TOKO</p>
          <h1>{type === "Perlengkapan" ? "Perlengkapan" : "Hamster & kelinci yang tersedia"}</h1>
          <p>{filtered.length} produk tersedia · harga dan stok diperbarui dari katalog toko.</p>
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

      <button className="mobile-filter-button" onClick={() => setFiltersOpen((value) => !value)} aria-expanded={filtersOpen}>Filter & urutkan</button>
      <div className="catalog-area">
        <aside className={filtersOpen ? "filters-open" : ""}>
          <div className="filter-heading"><div><strong>Filter</strong><span>Persempit pilihanmu</span></div><button onClick={clearFilters}>Reset</button></div>
          <fieldset>
            <legend>{type === "Perlengkapan" ? "Kategori" : "Jenis / ras"}</legend>
            {facets.map((facet) => (
              <label key={facet}>
                <input type="checkbox" checked={selected.includes(facet)} onChange={() => toggleFacet(facet)} />
                <span>{facet}</span>
              </label>
            ))}
          </fieldset>
          {!isSupplyView && (
            <>
              <fieldset>
                <legend>Jenis kelamin</legend>
                {['Jantan', 'Betina'].map((sex) => <label key={sex}><input type="checkbox" checked={sexes.includes(sex)} onChange={() => toggleValue(sex, setSexes)} /><span>{sex}</span></label>)}
              </fieldset>
              <fieldset>
                <legend>Karakter</legend>
                {['Tenang', 'Aktif', 'Ramah'].map((temperament) => <label key={temperament}><input type="checkbox" checked={temperaments.includes(temperament)} onChange={() => toggleValue(temperament, setTemperaments)} /><span>{temperament}</span></label>)}
              </fieldset>
            </>
          )}
        </aside>
        <section className="catalog-results">
          <div className="catalog-toolbar"><span>{filtered.length} hasil</span><label>Urutkan <select aria-label="Urutkan produk" value={sort} onChange={(event) => setSort(event.target.value)}><option value="recommended">Rekomendasi</option><option value="low">Harga terendah</option><option value="high">Harga tertinggi</option><option value="available">Stok tersedia dulu</option></select></label></div>
          {filtered.length > 0 ? (
            <div className="catalog-grid">{filtered.map((item) => <ProductCard item={item} key={item.id} />)}</div>
          ) : (
            <div className="empty-state"><h2>Belum ada hasil yang cocok.</h2><p>Coba hapus filter atau gunakan kata pencarian lain.</p><button onClick={clearFilters}>Tampilkan semua</button></div>
          )}
        </section>
      </div>
    </div>
  );
}
