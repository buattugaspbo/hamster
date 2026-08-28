import Link from "next/link";
import { Footer } from "../components/Footer";
import { HomeExperience } from "../components/HomeExperience";
import { ProductCard } from "../components/ProductCard";
import { StoreHeader } from "../components/StoreHeader";
import { getCatalog } from "../lib/catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  const catalog = await getCatalog();
  const animals = catalog.filter((item) => item.kind === "animal");
  const supplies = catalog.filter((item) => item.kind === "supply");
  return (
    <main>
      <StoreHeader transparent />
      <HomeExperience />

      <section className="home-stock content-shell">
        <div className="section-heading section-heading--split">
          <div>
            <p className="eyebrow">DIPOTRET LANGSUNG DI TOKO</p>
            <h2>Baru tiba minggu ini</h2>
          </div>
          <Link href="/shop" className="text-link">Lihat semua hewan →</Link>
        </div>
        <div className="featured-grid">
          {animals.filter((item) => item.featured).map((item) => <ProductCard item={item} key={item.id} />)}
        </div>
      </section>

      <section className="trust-band">
        <div><b>01</b><h3>Pemeriksaan kondisi</h3><p>Setiap hewan diperiksa sebelum ditampilkan sebagai tersedia.</p></div>
        <div><b>02</b><h3>Foto dan video aktual</h3><p>Lihat kondisi terbaru, bukan foto katalog yang digunakan berulang.</p></div>
        <div><b>03</b><h3>Dukungan setelah pembelian</h3><p>Konsultasi perawatan tetap tersedia setelah hewan dibawa pulang.</p></div>
      </section>

      <section className="supplies-feature content-shell">
        <div className="section-heading">
          <p className="eyebrow">HABITAT YANG LAYAK, BUKAN SEKADAR LUCU</p>
          <h2>Perlengkapan untuk hidup yang lebih baik</h2>
          <p>Habitat luas, pakan seimbang, enrichment, dan kebutuhan perawatan yang dipilih sesuai jenis hewan.</p>
        </div>
        <div className="featured-grid featured-grid--products">
          {supplies.filter((item) => item.featured).map((item) => <ProductCard item={item} key={item.id} />)}
        </div>
        <Link href="/shop?type=Perlengkapan" className="button button--solid button--center">Jelajahi semua perlengkapan</Link>
      </section>

      <section className="visit-strip" id="lokasi">
        <div>
          <p className="eyebrow">HOP & HAM · PALEMBANG</p>
          <h2>Datang, lihat kondisi mereka secara langsung.</h2>
        </div>
        <div className="visit-details">
          <span>Senin–Sabtu</span>
          <strong>09.00–18.00</strong>
          <Link href="/about#lokasi">Petunjuk arah →</Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
