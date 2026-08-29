"use client";

import Link from "next/link";
import { CSSProperties, useEffect, useRef, useState } from "react";

const HAMSTER_VIDEO = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Hamster%20on%20a%20wheel.webm";
const RABBIT_VIDEO = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Rabbit%20browsing.webm";

const scenes = [
  { number: "01", label: "Lihat", kicker: "STOK HAMSTER HARI INI", title: <>Lihat geraknya, <em>bukan cuma fotonya.</em></>, text: "Cek dulu cara dia makan, main, dan menjelajah. Kalau ada yang cocok, profil lengkapnya ada di katalog." },
  { number: "02", label: "Siapkan", kicker: "KANDANG, PAKAN, DAN PERLENGKAPAN", title: <>Sekalian siapin <em>rumahnya.</em></>, text: "Kami pilih ukuran kandang dan perlengkapan yang memang kepakai, jadi kamu nggak perlu menebak-nebak saat belanja." },
  { number: "03", label: "Mampir", kicker: "BISA DILIHAT LANGSUNG DI TOKO", title: <>Mau kenalan dulu? <em>Boleh.</em></>, text: "Datang ke toko Palembang, lihat kondisinya, lalu tanya apa pun soal makan, kandang, dan kebiasaan hariannya." },
  { number: "04", label: "Pesan", kicker: "PESAN ONLINE ATAU AMBIL DI TOKO", title: <>Sudah cocok? <em>Tinggal pesan.</em></>, text: "Pilih hewan atau perlengkapannya, tentukan jadwal, lalu bayar lewat QRIS sesuai total pesanan." },
];

export function HomeExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const hamsterRef = useRef<HTMLVideoElement>(null);
  const rabbitRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(0);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const max = section.offsetHeight - window.innerHeight;
      setProgress(Math.min(1, Math.max(0, -rect.top / Math.max(max, 1))));
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const hamster = hamsterRef.current;
    const rabbit = rabbitRef.current;
    if (!hamster || !rabbit) return;
    hamster.playbackRate = 0.88;
    rabbit.playbackRate = 0.78;
    if (progress < 0.58) {
      hamster.play().catch(() => undefined);
      rabbit.pause();
    } else {
      rabbit.play().catch(() => undefined);
      hamster.pause();
    }
  }, [progress, loaded]);

  const stage = progress < 0.25 ? 0 : progress < 0.52 ? 1 : progress < 0.78 ? 2 : 3;
  const hamsterFade = Math.max(0, Math.min(1, (0.65 - progress) / 0.16));
  const rabbitFade = Math.max(0, Math.min(1, (progress - 0.47) / 0.16));
  const portal = Math.max(0, Math.min(1, (progress - 0.26) / 0.28));
  const rabbitLift = Math.sin(Math.max(0, Math.min(1, (progress - 0.48) / 0.3)) * Math.PI) * 7;
  const style = {
    "--story-progress": progress,
    "--hamster-opacity": hamsterFade,
    "--rabbit-opacity": rabbitFade,
    "--portal-progress": portal,
    "--rabbit-lift": `${rabbitLift}vh`,
  } as CSSProperties;

  return (
    <section className="film-story" ref={sectionRef} style={style} aria-label="Film interaktif HOP & HAM">
      <div className="film-sticky">
        <div className="film-stage">
          <video
            ref={hamsterRef}
            className="film-layer film-layer--hamster"
            src={HAMSTER_VIDEO}
            poster="https://images.pexels.com/photos/33914110/pexels-photo-33914110/free-photo-of-adorable-golden-syrian-hamster-portrait-close-up.jpeg?auto=compress&cs=tinysrgb&w=1600"
            muted loop playsInline autoPlay preload="auto"
            onCanPlay={() => setLoaded((value) => value + 1)}
          />
          <video
            ref={rabbitRef}
            className="film-layer film-layer--rabbit"
            src={RABBIT_VIDEO}
            poster="https://images.unsplash.com/photo-1591382386627-349b692688ff?auto=format&fit=crop&w=1600&q=86"
            muted loop playsInline preload="metadata"
            onCanPlay={() => setLoaded((value) => value + 1)}
          />
          <div className="film-portal" aria-hidden="true"><span /><span /><span /></div>
          <div className="film-grade" aria-hidden="true" />
          <div className="film-grain" aria-hidden="true" />
        </div>

        <div className="film-topline" aria-hidden="true">
          <span>VIDEO TOKO</span><i /><span>HAMSTER & KELINCI</span><b>{Math.round(progress * 100).toString().padStart(2, "0")}</b>
        </div>

        <div className="film-copy-stack">
          {scenes.map((scene, index) => (
            <article key={scene.number} className={`film-copy film-copy--${index} ${stage === index ? "is-active" : ""}`} aria-hidden={stage !== index}>
              <p className="hero-kicker">{scene.kicker}</p>
              <h1>{scene.title}</h1>
              <p className="hero-lede">{scene.text}</p>
              {index === 3 && <div className="hero-actions"><Link href="/shop" className="button button--light">Lihat yang tersedia</Link><Link href="/register" className="button button--ghost">Buat akun</Link></div>}
            </article>
          ))}
        </div>

        <div className="film-timeline" aria-hidden="true">
          {scenes.map((scene, index) => <div className={stage === index ? "active" : ""} key={scene.number}><span>{scene.number}</span><strong>{scene.label}</strong></div>)}
          <i><b style={{ width: `${Math.max(3, progress * 100)}%` }} /></i>
        </div>

        <div className={`film-scroll ${progress > 0.94 ? "is-hidden" : ""}`}><span>GULIR UNTUK LANJUT</span><i>↓</i></div>
        <a className="film-credit" href="https://commons.wikimedia.org/" target="_blank" rel="noreferrer">Sumber video: Wikimedia Commons</a>
      </div>
    </section>
  );
}
