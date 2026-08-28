import Link from "next/link";
import { Footer } from "../../components/Footer";
import { StoreHeader } from "../../components/StoreHeader";

export default function AboutPage() {
  return (
    <main>
      <StoreHeader />
      <section className="about-hero">
        <div><p className="eyebrow">TENTANG HOP & HAM</p><h1>Tempat kecil dengan perhatian besar.</h1><p>Kami membantu calon pemilik memahami karakter, kebutuhan habitat, dan tanggung jawab sebelum membawa hamster atau kelinci pulang.</p></div>
        {/* eslint-disable-next-line @next/next/no-img-element */}<img src="https://images.pexels.com/photos/20049452/pexels-photo-20049452/free-photo-of-a-person-feeding-a-pet-rabbit.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Perawatan kelinci dengan interaksi lembut" />
      </section>
      <section className="values-row content-shell"><article><b>01</b><h2>Sehat sebelum dijual</h2><p>Kondisi umum, nafsu makan, kulit, dan aktivitas dicatat sebelum status tersedia diberikan.</p></article><article><b>02</b><h2>Perawatan transparan</h2><p>Foto aktual, umur, jenis kelamin, dan kebutuhan dasar ditampilkan secara jelas.</p></article><article><b>03</b><h2>Dukungan setelah pembelian</h2><p>Tim kami tetap membantu saat proses adaptasi di rumah baru.</p></article></section>
      <section className="buying-guide content-shell" id="cara-membeli"><div className="section-heading"><p className="eyebrow">PROSES PEMBELIAN</p><h2>Mudah, jelas, dan aman.</h2></div><div className="buying-steps"><article><b>1</b><h3>Pilih hewan</h3><p>Lihat profil, foto aktual, karakter, dan catatan kondisinya.</p></article><article><b>2</b><h3>Konsultasi singkat</h3><p>Kami memastikan habitat dan rutinitas perawatan sudah dipahami.</p></article><article><b>3</b><h3>Reservasi</h3><p>Pilih jadwal, lalu tunggu konfirmasi stok serta pembayaran.</p></article><article><b>4</b><h3>Jemput di toko</h3><p>Pengambilan langsung diprioritaskan untuk mengurangi stres hewan.</p></article></div></section>
      <section className="location-section content-shell" id="lokasi"><div><p className="eyebrow">KUNJUNGI TOKO KAMI</p><h2>Palembang, Sumatera Selatan</h2><p>Senin–Sabtu · 09.00–18.00</p><p>0812-3456-7890</p><div className="hero-actions"><a href="https://maps.google.com" className="button button--solid">Buka petunjuk arah</a><a href="https://wa.me/6281234567890" className="button button--outline">Hubungi kami</a></div></div><div className="map-card"><span>HOP & HAM</span><i>⌖</i><small>Palembang</small></div></section>
      <section className="about-cta"><h2>Siap menemukan teman kecilmu?</h2><Link href="/shop" className="button button--solid">Lihat yang tersedia</Link></section>
      <Footer />
    </main>
  );
}
