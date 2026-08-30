import Link from "next/link";
import { Footer } from "../../components/Footer";
import { StoreHeader } from "../../components/StoreHeader";
import { createWhatsAppUrl, PLACEHOLDER_WHATSAPP_LABEL } from "../../lib/contact";

export default function AboutPage() {
  return (
    <main>
      <StoreHeader />
      <section className="about-hero">
        <div><p className="eyebrow">TOKO KAMI</p><h1>HOP & HAM, toko kecil di Palembang.</h1><p>Kami jual hamster, kelinci, kandang, pakan, dan perlengkapannya. Kalau kamu baru pertama pelihara, tanya saja—kami bantu pilih yang memang perlu.</p></div>
        {/* eslint-disable-next-line @next/next/no-img-element */}<img src="https://images.pexels.com/photos/20049452/pexels-photo-20049452/free-photo-of-a-person-feeding-a-pet-rabbit.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Perawatan kelinci dengan interaksi lembut" />
      </section>
      <section className="values-row content-shell"><article><b>01</b><h2>Kami cek dulu</h2><p>Makan, gerak, kulit, dan bulunya dicek sebelum hewan ditampilkan di katalog.</p></article><article><b>02</b><h2>Info apa adanya</h2><p>Umur, jenis kelamin, karakter, dan foto stok ditulis sesuai kondisi yang sekarang.</p></article><article><b>03</b><h2>Sesudah dibawa pulang</h2><p>Masih bingung soal pakan atau adaptasi? Chat kami lewat WhatsApp.</p></article></section>
      <section className="buying-guide content-shell" id="cara-membeli"><div className="section-heading"><p className="eyebrow">CARA PESAN</p><h2>Nggak ribet.</h2></div><div className="buying-steps"><article><b>1</b><h3>Lihat stok</h3><p>Cek foto, umur, karakter, dan catatan kondisi di profilnya.</p></article><article><b>2</b><h3>Tanya dulu</h3><p>Chat kami kalau mau memastikan kandang, pakan, atau kebiasaannya.</p></article><article><b>3</b><h3>Buat reservasi</h3><p>Pilih tanggal pengambilan lalu bayar lewat QRIS.</p></article><article><b>4</b><h3>Ambil di toko</h3><p>Datang sesuai jadwal. Kami jelaskan rutinitas makan sebelum kamu pulang.</p></article></div></section>
      <section className="location-section content-shell" id="lokasi"><div><p className="eyebrow">KUNJUNGI TOKO KAMI</p><h2>Palembang, Sumatera Selatan</h2><p>Senin–Sabtu · 09.00–18.00</p><p>{PLACEHOLDER_WHATSAPP_LABEL}</p><div className="hero-actions"><a href="https://maps.google.com" className="button button--solid">Buka petunjuk arah</a><a href={createWhatsAppUrl()} className="button button--outline">Hubungi kami</a></div></div><div className="map-card"><span>HOP & HAM</span><i>⌖</i><small>Palembang</small></div></section>
      <section className="about-cta"><h2>Mau lihat stok hari ini?</h2><Link href="/shop" className="button button--solid">Buka katalog</Link></section>
      <Footer />
    </main>
  );
}
