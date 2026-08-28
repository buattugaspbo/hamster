"use client";

import Link from "next/link";
import { CatalogItem, formatRupiah } from "../lib/data";
import { addCartItem } from "../lib/cart";

export function ProductCard({ item }: { item: CatalogItem }) {
  const isAnimal = item.kind === "animal";

  const addToCart = () => {
    addCartItem(item.id);
  };

  return (
    <article className="product-card">
      <Link href={isAnimal ? `/animal/${item.slug}` : `/shop#${item.slug}`} className="product-image-wrap">
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
          {isAnimal && <span>{item.sex === "Jantan" ? "♂" : "♀"}</span>}
        </div>
        <p className="product-meta">
          {isAnimal ? `${item.species} · ${item.age} · ${item.code}` : item.description}
        </p>
        <div className="product-card-footer">
          <strong>{formatRupiah(item.price)}</strong>
          {isAnimal ? (
            <Link href={`/animal/${item.slug}`} className="text-action">Lihat detail →</Link>
          ) : (
            <button onClick={addToCart} className="text-action" disabled={item.stock < 1}>+ Tambah</button>
          )}
        </div>
      </div>
    </article>
  );
}
