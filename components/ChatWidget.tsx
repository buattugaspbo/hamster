"use client";

import { FormEvent, useState } from "react";
import { usePathname } from "next/navigation";
import { createWhatsAppUrl } from "../lib/contact";

export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  if (pathname.startsWith("/admin") || pathname === "/login" || pathname === "/register") return null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = message.trim();
    if (!value) return;
    window.open(createWhatsAppUrl(value), "_blank", "noopener,noreferrer");
    setMessage("");
  };

  return (
    <div className={`chat-widget ${open ? "is-open" : ""}`}>
      {open && <section className="chat-panel" aria-label="Chat dengan admin">
        <header><div><strong>Chat dengan admin</strong><span><i /> Siap bantu saat jam toko</span></div><button type="button" onClick={() => setOpen(false)} aria-label="Tutup chat">×</button></header>
        <div className="chat-messages"><p>Halo! Mau tanya soal hamster, kandang, packing, atau pengiriman?</p><small>Pesan diteruskan ke WhatsApp admin. Nomor yang dipakai saat ini masih nomor sementara.</small></div>
        <form onSubmit={submit}><textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} placeholder="Tulis pesan…" aria-label="Pesan untuk admin" /><button type="submit" disabled={!message.trim()}>Kirim ke admin</button></form>
      </section>}
      <button className="chat-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}><span>◌</span>{open ? "Tutup" : "Chat admin"}</button>
    </div>
  );
}
