"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "./BrandLogo";
import { readCart } from "../lib/cart";

export function StoreHeader({ transparent = false }: { transparent?: boolean }) {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const update = () => {
      try {
        setCartCount(readCart().reduce((sum, entry) => sum + entry.quantity, 0));
      } catch {
        setCartCount(0);
      }
    };
    update();
    window.addEventListener("storage", update);
    window.addEventListener("hop-cart", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("hop-cart", update);
    };
  }, []);

  return (
    <header className={`store-header ${transparent ? "store-header--overlay" : ""}`}>
      <BrandLogo />
      <button className="menu-toggle" onClick={() => setOpen((value) => !value)} aria-label="Buka menu">
        <span />
        <span />
      </button>
      <nav className={open ? "nav-open" : ""}>
        <Link href="/shop?type=Hamster">Hamster</Link>
        <Link href="/shop?type=Kelinci">Kelinci</Link>
        <Link href="/shop?type=Perlengkapan">Perlengkapan</Link>
        <Link href="/about#cara-membeli">Cara Membeli</Link>
        <Link href="/about">Tentang Kami</Link>
      </nav>
      <div className="header-actions">
        <Link href="/shop" className="icon-link" aria-label="Cari">⌕</Link>
        <Link href="/account" className="account-link" aria-label="Akun saya"><span>Masuk</span><b>◯</b></Link>
        <Link href="/cart" className="cart-link" aria-label={`Keranjang, ${cartCount} barang`}>
          <span>Keranjang</span>
          <b>{cartCount}</b>
        </Link>
        <a className="whatsapp-button" href="https://wa.me/6281234567890" target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </div>
    </header>
  );
}
