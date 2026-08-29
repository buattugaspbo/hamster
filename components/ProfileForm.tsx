"use client";

import { FormEvent, useState } from "react";

type Profile = { full_name?: string; phone?: string; birthday?: string; gender?: string };

export function ProfileForm({ profile, email }: { profile: Profile; email: string }) {
  const [saving, setSaving] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setMessage(""); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/account/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName: form.get("fullName"), phone: form.get("phone"), birthday: form.get("birthday"), gender: form.get("gender") }) });
    const payload = await response.json() as { error?: string };
    if (response.ok) setMessage("Perubahan tersimpan."); else setError(payload.error || "Gagal menyimpan profil");
    setSaving(false);
  };
  const initials = (profile.full_name || email).split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <form className="profile-form" onSubmit={submit}><section><div className="profile-avatar">{initials}</div><div><h2>Informasi pribadi</h2><p>Nama dan nomor ini dipakai saat kami menghubungi kamu.</p></div></section>{error && <p className="form-error">{error}</p>}{message && <p className="form-success">{message}</p>}<div className="form-row"><label>Nama lengkap<input name="fullName" required defaultValue={profile.full_name || ""} /></label><label>Tanggal lahir<input name="birthday" type="date" defaultValue={profile.birthday || ""} /></label></div><div className="form-row"><label>Email<input type="email" value={email} readOnly /></label><label>Nomor WhatsApp<input name="phone" required defaultValue={profile.phone || ""} /></label></div><label>Jenis kelamin<select name="gender" defaultValue={profile.gender || ""}><option value="">Pilih</option><option>Laki-laki</option><option>Perempuan</option><option>Tidak ingin menyebutkan</option></select></label><div className="profile-form__actions"><button className="button button--solid" disabled={saving}>{saving ? "Menyimpan…" : "Simpan perubahan"}</button></div></form>;
}
