"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CatalogItem } from "../../lib/data";
import { formatRupiah, getAnimalSexStock } from "../../lib/data";
import { readCart, writeCart, type CartEntry } from "../../lib/cart";

export function CartClient() {
  const [entries, setEntries] = useState<CartEntry[]>([]);
  const [products, setProducts] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setEntries(readCart()));
    fetch("/api/products")
      .then((response) => response.json() as Promise<{ products?: CatalogItem[] }>)
      .then((payload) => setProducts(payload.products || []))
      .finally(() => setLoading(false));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const items = useMemo(() => entries.flatMap((entry) => {
    const product = products.find((item) => item.id === entry.id);
    if (!product) return [];
    const maximum = entry.sex ? getAnimalSexStock(product, entry.sex) : product.stock;
    return [{ product, sex: entry.sex, quantity: Math.min(entry.quantity, Math.max(maximum, 1)), maximum }];
  }), [entries, products]);
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const updateQuantity = (id: string, quantity: number, sex?: CartEntry["sex"]) => {
    const next = quantity < 1
      ? entries.filter((entry) => entry.id !== id || entry.sex !== sex)
      : entries.map((entry) => entry.id === id && entry.sex === sex ? { ...entry, quantity } : entry);
    setEntries(next);
    writeCart(next);
  };

  if (loading) return <div className="empty-cart content-shell"><p>Menyiapkan keranjang…</p></div>;
  if (items.length === 0) {
    return <div className="empty-cart content-shell"><p className="eyebrow">KERANJANG</p><h1>Keranjangmu masih kosong.</h1><p>Cari kandang, pakan, atau perlengkapan lain di katalog.</p><Link href="/shop?type=Perlengkapan" className="button button--solid">Lihat perlengkapan</Link></div>;
  }

  return (
    <div className="cart-page content-shell">
      <div><p className="eyebrow">KERANJANG</p><h1>Isi keranjang</h1></div>
      <div className="cart-grid">
        <section className="cart-list">
          {items.map(({ product, quantity, maximum, sex }) => (
            <article key={`${product.id}-${sex || "default"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}<img src={product.image} alt={product.name} />
              <div><span>{product.category}{sex ? ` · ${sex}` : ""}</span><h2>{product.name}</h2><p>{product.description}</p><strong>{formatRupiah(product.price * quantity)}</strong><label className="cart-quantity">Jumlah<button type="button" aria-label={`Kurangi ${product.name}`} disabled={quantity <= 1} onClick={() => updateQuantity(product.id, quantity - 1, sex)}>−</button><input aria-label={`Jumlah ${product.name}`} type="number" min={1} max={maximum} value={quantity} onChange={(event) => updateQuantity(product.id, Math.min(maximum, Math.max(1, Number(event.target.value) || 1)), sex)} /><button type="button" aria-label={`Tambah ${product.name}`} disabled={quantity >= maximum} onClick={() => updateQuantity(product.id, quantity + 1, sex)}>+</button></label></div>
              <button onClick={() => updateQuantity(product.id, 0, sex)}>Hapus</button>
            </article>
          ))}
        </section>
        <aside className="cart-summary">
          <h2>Ringkasan</h2><div><span>Subtotal</span><strong>{formatRupiah(total)}</strong></div><div><span>Pengiriman</span><strong>Dihitung di checkout</strong></div><div className="cart-total"><span>Total sementara</span><strong>{formatRupiah(total)}</strong></div>
          <Link href="/checkout" className="button button--solid">Lanjut ke checkout</Link>
          <small>Harga dan stok dicek lagi saat pesanan dibuat.</small>
        </aside>
      </div>
    </div>
  );
}
