import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "../../../components/Footer";
import { StoreHeader } from "../../../components/StoreHeader";
import { formatRupiah } from "../../../lib/data";
import { getProductBySlug } from "../../../lib/catalog";
import { ReserveActions } from "./ReserveActions";

export default async function AnimalDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getProductBySlug(slug);
  if (!item || item.kind !== "animal") notFound();

  return (
    <main>
      <StoreHeader />
      <div className="detail-page content-shell">
        <div className="breadcrumb"><Link href="/">Beranda</Link><span>/</span><Link href={`/shop?type=${item.species}`}>{item.species}</Link><span>/</span><strong>{item.name}</strong></div>
        <div className="detail-grid">
          <section className="detail-gallery">
            <div className="detail-main-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={`${item.name}, ${item.breed}`} />
              <span className="camera-note">Foto kondisi terbaru · 24 Agustus</span>
            </div>
            <div className="detail-thumbnails">
              {[item.image, item.image, item.image].map((image, index) => (
                <button key={index} className={index === 0 ? "active" : ""} aria-label={`Lihat foto ${index + 1}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}<img src={image} alt="" />
                </button>
              ))}
              <button className="video-thumb">▶<small>Video 00:18</small></button>
            </div>
          </section>
          <section className="detail-info">
            <div className="availability"><i /> {item.status}</div>
            <h1>{item.name}</h1>
            <p className="detail-subtitle">{item.species} {item.breed} · {item.sex} · {item.age}</p>
            <strong className="detail-price">{formatRupiah(item.price)}</strong>
            <span className="detail-code">{item.code}</span>
            <p className="detail-description">{item.description}</p>
            <div className="animal-facts">
              <div><span>Usia</span><strong>{item.age}</strong></div>
              <div><span>Jenis kelamin</span><strong>{item.sex}</strong></div>
              <div><span>Karakter</span><strong>{item.temperament}</strong></div>
              <div><span>Lokasi</span><strong>Palembang</strong></div>
            </div>
            <div className="health-panel">
              <h2>Catatan kondisi</h2>
              <div><span>✓</span><p><strong>Sudah diperiksa</strong><small>Pemeriksaan kondisi umum</small></p></div>
              <div><span>✓</span><p><strong>Bebas kutu</strong><small>Bulu dan kulit bersih</small></p></div>
              <div><span>✓</span><p><strong>Nafsu makan baik</strong><small>Aktif dan responsif</small></p></div>
            </div>
            <ReserveActions item={item} />
          </section>
        </div>
        <div className="detail-notes">
          <article><h2>Tentang {item.name}</h2><p>{item.description} Tim kami akan menjelaskan kebiasaan makan dan rutinitasnya sebelum pengambilan.</p></article>
          <article><h2>Riwayat kesehatan</h2><p>Catatan kondisi diperbarui oleh tim perawatan dan dapat dikonfirmasi kembali melalui WhatsApp.</p></article>
          <article><h2>Cara perawatan</h2><p>Gunakan habitat yang cukup luas, sediakan pakan sesuai jenis, air bersih, dan waktu adaptasi tanpa paksaan.</p></article>
        </div>
      </div>
      <Footer />
    </main>
  );
}
