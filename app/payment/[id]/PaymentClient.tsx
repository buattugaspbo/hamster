"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatRupiah } from "../../../lib/data";

type OrderView = {
  id: string;
  total: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  expiresAt: string | null;
  items: { productName: string; unitPrice: number; quantity: number }[];
};

export function PaymentClient({ id }: { id: string }) {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [order, setOrder] = useState<OrderView | null>(null);
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [now, setNow] = useState<number | null>(null);

  const query = useMemo(() => token ? `?token=${encodeURIComponent(token)}` : "", [token]);
  const loadOrder = useCallback(async () => {
    const response = await fetch(`/api/orders/${encodeURIComponent(id)}${query}`, { cache: "no-store" });
    const payload = await response.json() as { order?: OrderView; error?: string };
    if (!response.ok || !payload.order) throw new Error(payload.error || "Pesanan tidak ditemukan");
    setOrder(payload.order);
    return payload.order;
  }, [id, query]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void Promise.all([
        loadOrder(),
        fetch(`/api/orders/${encodeURIComponent(id)}/qris${query}`, { cache: "no-store" })
          .then(async (response) => {
            const payload = await response.json() as { dataUrl?: string; error?: string };
            if (!response.ok || !payload.dataUrl) throw new Error(payload.error || "QRIS gagal dibuat");
            setQr(payload.dataUrl);
          }),
      ]).catch((reason) => setError(reason instanceof Error ? reason.message : "Pembayaran gagal dimuat"));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [id, loadOrder, query]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setNow(Date.now()));
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    const polling = window.setInterval(() => loadOrder().catch(() => undefined), 5000);
    return () => { window.cancelAnimationFrame(frame); window.clearInterval(clock); window.clearInterval(polling); };
  }, [loadOrder]);

  const secondsLeft = now === null ? 0 : Math.max(0, Math.floor(((order?.expiresAt ? new Date(order.expiresAt).getTime() : now) - now) / 1000));
  const hours = String(Math.floor(secondsLeft / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  const sendPaymentNotice = async () => {
    setNoticeLoading(true); setError("");
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(id)}/payment-notice`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Konfirmasi gagal dikirim");
      await loadOrder();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Konfirmasi gagal dikirim");
    } finally {
      setNoticeLoading(false);
    }
  };

  if (order?.paymentStatus === "Dibayar") {
    return <div className="payment-success"><span>✓</span><p className="eyebrow">PEMBAYARAN DITERIMA</p><h1>Pembayaran sudah masuk.</h1><p>Kami cek pesananmu lalu mulai menyiapkannya.</p><div><Link href={`/account/orders/${id}`} className="button button--solid">Lihat pesanan</Link><Link href="/shop" className="button button--outline">Kembali belanja</Link></div></div>;
  }

  return (
    <div className="payment-page content-shell">
      <header className="payment-heading"><div><p className="eyebrow">BAYAR VIA QRIS</p><h1>Selesaikan pembayaran</h1><p>Pesanan <strong>{id}</strong> · nominalnya sudah diisi otomatis</p></div><div className="payment-timer"><span>{hours}</span><i>:</i><span>{minutes}</span><i>:</i><span>{seconds}</span><small>JAM&nbsp;&nbsp;&nbsp;&nbsp;MENIT&nbsp;&nbsp;&nbsp;&nbsp;DETIK</small></div></header>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="payment-grid payment-grid--qris">
        <section className="payment-methods"><h2>Ringkasan pesanan</h2>{order?.items.map((item) => <div className="payment-order-row" key={item.productName}><span>{item.productName} × {item.quantity}</span><strong>{formatRupiah(item.unitPrice * item.quantity)}</strong></div>)}<div className="payment-security"><span>⌾</span><p><strong>Nominal sudah sesuai pesanan</strong><small>QRIS ini dibuat dari total yang tertera di halaman ini.</small></p></div></section>
        <aside className="payment-instruction"><div className="payment-card-head"><span>Total pembayaran</span><strong>{order ? formatRupiah(order.total) : "Memuat…"}</strong></div><div className="qris-head"><b>QRIS</b><span>NMID: ID1026534598481</span></div>{qr ? <>{/* eslint-disable-next-line @next/next/no-img-element */}<img className="qris-dynamic-image" src={qr} alt={`QRIS pembayaran ${formatRupiah(order?.total || 0)}`} /><p className="payment-note">Pindai dari aplikasi bank atau e-wallet. Cek nama merchant dan nominal sebelum bayar.</p><a href={qr} download={`QRIS-${id}.png`} className="button button--outline">Unduh QRIS</a></> : <div className="qr-loading">Membuat QRIS sesuai total…</div>}<button onClick={sendPaymentNotice} disabled={!qr || noticeLoading || order?.paymentStatus === "Menunggu verifikasi"} className="button button--solid payment-confirm">{order?.paymentStatus === "Menunggu verifikasi" ? "Menunggu verifikasi admin" : noticeLoading ? "Mengirim…" : "Saya sudah membayar"}</button><small className="prototype-note">Setelah menekan tombol ini, admin akan mengecek pembayaranmu.</small></aside>
      </div>
      <Link href={`/account/orders/${id}`} className="payment-back">← Kembali ke detail pesanan</Link>
    </div>
  );
}
