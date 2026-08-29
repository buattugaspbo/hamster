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
            <p className="eyebrow">PILIHAN MINGGU INI</p>
            <h2>Yang lagi ada di toko</h2>
          </div>
          <Link href="/shop" className="text-link">Lihat semua hewan →</Link>
        </div>
        <div className="featured-grid">
          {animals.filter((item) => item.featured).map((item) => <ProductCard item={item} key={item.id} />)}
        </div>
      </section>

      <section className="trust-band">
        <div><b>01</b><h3>Dicek sebelum tayang</h3><p>Kami cek makan, gerak, kulit, dan bulunya sebelum statusnya dibuat tersedia.</p></div>
        <div><b>02</b><h3>Foto stok yang sekarang</h3><p>Foto di profil adalah hewan yang sedang ada, bukan gambar contoh dari internet.</p></div>
        <div><b>03</b><h3>Masih bisa tanya setelah beli</h3><p>Kalau bingung soal pakan atau adaptasi di rumah, chat saja lewat WhatsApp.</p></div>
      </section>

      <section className="supplies-feature content-shell">
        <div className="section-heading">
          <p className="eyebrow">KEBUTUHAN HARIAN</p>
          <h2>Kandang, pakan, dan perlengkapan</h2>
          <p>Mulai dari bedding sampai carrier. Pilih per kategori atau tanya kami kalau belum yakin ukurannya.</p>
        </div>
        <div className="featured-grid featured-grid--products">
          {supplies.filter((item) => item.featured).map((item) => <ProductCard item={item} key={item.id} />)}
        </div>
        <Link href="/shop?type=Perlengkapan" className="button button--solid button--center">Lihat semua perlengkapan</Link>
      </section>

      <section className="visit-strip" id="lokasi">
        <div>
          <p className="eyebrow">TOKO PALEMBANG</p>
          <h2>Kalau mau lihat langsung, mampir aja.</h2>
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
