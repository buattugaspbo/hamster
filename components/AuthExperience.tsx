"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "./BrandLogo";
import { createClient } from "../lib/supabase/client";

function safeNextPath() {
  const value = new URLSearchParams(window.location.search).get("next") || "/account";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

export function AuthExperience({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const isRegister = mode === "register";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const supabase = createClient();
      if (isRegister) {
        const { data, error: authError } = await supabase.auth.signUp({
          email: String(form.get("email")), password: String(form.get("password")),
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNextPath())}`,
            data: { full_name: String(form.get("name")), phone: String(form.get("phone")) },
          },
        });
        if (authError) throw authError;
        if (!data.session) {
          setMessage("Akun dibuat. Periksa email untuk mengaktifkan akunmu.");
          return;
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: String(form.get("email")), password: String(form.get("password")),
        });
        if (authError) throw authError;
      }
      router.push(safeNextPath()); router.refresh();
    } catch (reason) {
      const detail = reason instanceof Error ? reason.message : "";
      setError(detail.includes("Supabase belum dikonfigurasi")
        ? "Akun belum aktif di alamat website ini. Coba lagi setelah database disambungkan oleh admin toko."
        : detail || "Email atau kata sandi belum cocok. Coba periksa lagi.");
    } finally {
      setLoading(false);
    }
  };

  const continueWithGoogle = async () => {
    setError(""); setMessage(""); setGoogleLoading(true);
    await new Promise((resolve) => window.setTimeout(resolve, 1800));
    setGoogleLoading(false);
    setError("Login Google gagal. Silakan masuk memakai email dan kata sandi.");
  };

  return (
    <main className="auth-page">
      <section className="auth-visual"><video src="https://commons.wikimedia.org/wiki/Special:Redirect/file/2014-03-16%20Cult%20film%20%28rabbit%20cult%29%20anagoria.webm" muted loop autoPlay playsInline /><div className="auth-visual__grade" /><div className="auth-quote"><p>Pastikan kandang dan pakannya sudah siap sebelum dibawa pulang.</p><span>CATATAN DARI TIM TOKO</span></div></section>
      <section className="auth-panel"><BrandLogo /><div className="auth-box"><p className="eyebrow">{isRegister ? "DAFTAR" : "MASUK"}</p><h1>{isRegister ? "Buat akun" : "Masuk ke akun"}</h1><p>{isRegister ? "Biar alamat dan riwayat pesananmu tersimpan." : "Cek pesanan, pembayaran, dan reservasi dari sini."}</p><button className="social-auth" type="button" onClick={continueWithGoogle} disabled={googleLoading}><span className={googleLoading ? "google-spinner" : ""}>{googleLoading ? "" : "G"}</span>{googleLoading ? "Menghubungkan Google…" : "Lanjutkan dengan Google"}</button><div className="auth-divider"><i />atau dengan email<i /></div>{error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-success" role="status">{message}</p>}<form onSubmit={submit}>{isRegister && <label>Nama lengkap<input name="name" required placeholder="Nama sesuai identitas" /></label>}<label>Email<input name="email" type="email" required placeholder="nama@email.com" /></label>{isRegister && <label>Nomor WhatsApp<input name="phone" inputMode="tel" required placeholder="08xxxxxxxxxx" /></label>}<label>Kata sandi<input name="password" type="password" required minLength={8} placeholder="Minimal 8 karakter" /></label>{!isRegister && <div className="auth-helper"><label><input type="checkbox" /> Ingat saya</label><Link href="/login?forgot=1">Lupa kata sandi?</Link></div>}{isRegister && <label className="auth-check"><input type="checkbox" required /><span>Saya menyetujui syarat layanan dan kebijakan privasi HOP & HAM.</span></label>}<button className="button button--solid" disabled={loading}>{loading ? "Memproses…" : isRegister ? "Buat akun" : "Masuk"}</button></form><p className="auth-switch">{isRegister ? "Sudah punya akun?" : "Belum punya akun?"} <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "Masuk" : "Daftar sekarang"}</Link></p></div></section>
    </main>
  );
}
