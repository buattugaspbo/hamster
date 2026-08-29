import Link from "next/link";
import { BrandLogo } from "./BrandLogo";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <BrandLogo compact />
        <div>
          <h3>HOP & HAM</h3>
          <p>Toko hamster, kelinci, dan perlengkapannya di Palembang.</p>
        </div>
      </div>
      <div>
        <strong>Belanja</strong>
        <Link href="/shop?type=Hamster">Hamster</Link>
        <Link href="/shop?type=Kelinci">Kelinci</Link>
        <Link href="/shop?type=Perlengkapan">Perlengkapan</Link>
      </div>
      <div>
        <strong>Informasi</strong>
        <Link href="/about#cara-membeli">Cara membeli</Link>
        <Link href="/about">Tentang toko</Link>
        <Link href="/about#lokasi">Lokasi</Link>
      </div>
      <div>
        <strong>Akun</strong>
        <Link href="/login">Masuk</Link>
        <Link href="/register">Daftar</Link>
        <Link href="/account/orders">Transaksi saya</Link>
      </div>
      <div>
        <strong>Hubungi kami</strong>
        <a href="https://wa.me/6281234567890">0812-3456-7890</a>
        <span>Palembang, Sumatera Selatan</span>
        <span>Senin–Sabtu · 09.00–18.00</span>
      </div>
    </footer>
  );
}
