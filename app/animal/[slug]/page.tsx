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
              <span className="camera-note">Foto stok saat ini</span>
            </div>
          </section>
          <section className="detail-info">
            <div className="availability"><i /> {item.status}</div>
            <h1>{item.name}</h1>
            <p className="detail-subtitle">{item.species} {item.breed} · Jantan & Betina · {item.age}</p>
            <strong className="detail-price">{formatRupiah(item.price)}</strong>
            <span className="detail-code">{item.code}</span>
            <p className="detail-description">{item.description}</p>
            <div className="animal-facts">
              <div><span>Usia</span><strong>{item.age}</strong></div>
              <div><span>Jenis kelamin</span><strong>Jantan & Betina</strong></div>
              <div><span>Karakter</span><strong>{item.temperament}</strong></div>
              <div><span>Lokasi</span><strong>Palembang</strong></div>
            </div>
            <div className="health-panel">
              <h2>Catatan kondisi</h2>
              <div><span>✓</span><p><strong>Kondisi umum sudah dicek</strong><small>Gerak dan responsnya normal</small></p></div>
              <div><span>✓</span><p><strong>Kulit dan bulu bersih</strong><small>Tidak ada kutu yang terlihat</small></p></div>
              <div><span>✓</span><p><strong>Makan dengan baik</strong><small>Jadwal makan teratur</small></p></div>
            </div>
            <ReserveActions item={item} />
          </section>
        </div>
        <div className="detail-notes">
          <article><h2>Tentang {item.name}</h2><p>{item.description} Sebelum diambil, kami jelaskan jadwal makan dan kebiasaannya sehari-hari.</p></article>
          <article><h2>Catatan terbaru</h2><p>Kalau mau memastikan kondisinya sebelum reservasi, chat kami lewat WhatsApp.</p></article>
          <article><h2>Sebelum dibawa pulang</h2><p>Siapkan kandang, pakan, dan air bersih lebih dulu. Setelah sampai rumah, beri waktu untuk beradaptasi tanpa sering dipegang.</p></article>
        </div>
      </div>
      <Footer />
    </main>
  );
}
