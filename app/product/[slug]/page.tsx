import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "../../../components/Footer";
import { StoreHeader } from "../../../components/StoreHeader";
import { getProductBySlug } from "../../../lib/catalog";
import { formatRupiah } from "../../../lib/data";
import { ProductPurchaseActions } from "./ProductPurchaseActions";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getProductBySlug(slug);
  if (!item || item.kind !== "supply") notFound();
  return <main><StoreHeader /><div className="detail-page content-shell"><div className="breadcrumb"><Link href="/">Beranda</Link><span>/</span><Link href="/shop?type=Perlengkapan">Perlengkapan</Link><span>/</span><strong>{item.name}</strong></div><div className="detail-grid"><section className="detail-gallery"><div className="detail-main-image">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={item.image} alt={item.name} /><span className="camera-note">Foto produk</span></div></section><section className="detail-info"><div className="availability"><i /> {item.status}</div><h1>{item.name}</h1><p className="detail-subtitle">{item.category}{item.dimensions ? ` · ${item.dimensions}` : ""}</p><strong className="detail-price">{formatRupiah(item.price)}</strong><p className="detail-description">{item.description}</p><div className="animal-facts"><div><span>Stok</span><strong>{item.stock} unit</strong></div><div><span>Berat</span><strong>{item.weightGrams ? `${item.weightGrams / 1000} kg` : "—"}</strong></div></div><ProductPurchaseActions id={item.id} stock={item.stock} /></section></div></div><Footer /></main>;
}
