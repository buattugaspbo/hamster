"use client";

import Link from "next/link";
import { CatalogItem, formatRupiah } from "../lib/data";
import { addCartItem } from "../lib/cart";
import { useState } from "react";

export function ProductCard({ item }: { item: CatalogItem }) {
  const isAnimal = item.kind === "animal";
  const detailHref = isAnimal ? `/animal/${item.slug}` : `/product/${item.slug}`;
  const [added, setAdded] = useState(false);

  const addToCart = () => {
    addCartItem(item.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article className="product-card" id={item.slug}>
      <Link href={detailHref} className="product-image-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image} alt={`${item.name}, ${item.breed || item.category}`} className="product-image" />
        <span className={`status-badge ${item.status !== "Tersedia" ? "status-badge--warm" : ""}`}>
          <i /> {item.status}
        </span>
      </Link>
      <div className="product-card-body">
        <p className="eyebrow">{item.breed || item.category}</p>
        <div className="product-title-row">
          <h3>{item.name}</h3>
          {isAnimal && <span>♀ ♂</span>}
        </div>
        <p className="product-meta">
          {isAnimal ? `${item.species} · ${item.age} · ${item.code}` : item.description}
        </p>
        <div className="product-card-footer">
          <strong>{formatRupiah(item.price)}</strong>
          {isAnimal ? (
            <Link href={detailHref} className="text-action">Lihat detail →</Link>
          ) : (
            <><Link href={detailHref} className="text-action">Lihat detail →</Link><button onClick={addToCart} className={`text-action ${added ? "is-added" : ""}`} disabled={item.stock < 1}>{added ? "✓ Ditambahkan" : "+ Tambah"}</button></>
          )}
        </div>
      </div>
    </article>
  );
}
