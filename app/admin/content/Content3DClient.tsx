"use client";

import { useState } from "react";

export function Content3DClient() {
  const [saved, setSaved] = useState(false);
  const [quality, setQuality] = useState("Otomatis");
  return (
    <main className="admin-content content3d-page">
      <div className="admin-page-title"><div><p>TAMPILAN HOMEPAGE</p><h1>Video & teks homepage</h1></div><button className="admin-primary" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2400); }}>{saved ? "Tersimpan ✓" : "Simpan Perubahan"}</button></div>
      <div className="content3d-grid">
        <section className="admin-panel scene-list"><div className="panel-heading"><div><h2>Urutan adegan</h2><span>Video dan teks berganti saat halaman digulir.</span></div></div>{[["01","Hamster berlari","0–25%"],["02","Kandang & perlengkapan","25–52%"],["03","Kelinci melompat","52–78%"],["04","Cara memesan","78–100%"]].map(([number,title,range],index) => <button className={index === 0 ? "active" : ""} key={number}><b>{number}</b><div><strong>{title}</strong><span>Posisi scroll {range}</span></div><em>☷</em></button>)}</section>
        <section className="admin-panel scene-editor"><div className="scene-preview"><div className="film-admin-preview"><video src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Hamster%20on%20a%20wheel.webm" muted loop autoPlay playsInline/><span>HAMSTER BERLARI</span></div><div className="preview-controls"><button>▶ Pratinjau</button><span>Video · Kualitas otomatis</span></div></div><div className="scene-fields"><h2>Hamster berlari</h2><label>File video<input defaultValue="hamster-wheel-film.webm"/></label><label>Judul adegan<input defaultValue="Lihat geraknya, bukan cuma fotonya."/></label><label>Teks pendukung<textarea rows={3} defaultValue="Cek dulu cara dia makan, main, dan menjelajah. Kalau ada yang cocok, profil lengkapnya ada di katalog."/></label><div className="drawer-form-row"><label>Mulai scroll<input defaultValue="0%"/></label><label>Selesai scroll<input defaultValue="25%"/></label></div><label>Produk unggulan<select defaultValue="Mochi · Syrian"><option>Mochi · Syrian</option><option>Boba · Campbell</option><option>Yuki · Winter White</option></select></label></div></section>
        <section className="admin-panel performance-panel"><div className="panel-heading"><h2>Video & perangkat</h2></div><label>Kualitas video<select value={quality} onChange={(event) => setQuality(event.target.value)}><option>Otomatis</option><option>Tinggi</option><option>Hemat data</option></select></label><label className="drawer-check"><input type="checkbox" defaultChecked/><span>Muat video berikutnya lebih awal</span></label><label className="drawer-check"><input type="checkbox" defaultChecked/><span>Kurangi animasi jika diminta perangkat</span></label><label className="drawer-check"><input type="checkbox" defaultChecked/><span>Tampilkan gambar jika video gagal dimuat</span></label><div className="performance-score"><span>Status video</span><strong>Siap</strong><i><b/></i><small>Dua video utama aktif. Gambar pengganti akan tampil pada koneksi lambat.</small></div></section>
      </div>
    </main>
  );
}
