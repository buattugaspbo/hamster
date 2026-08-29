import Link from "next/link";
import { getAccountOrders } from "../../lib/account-data";
import { getUserProfile, requireUser } from "../../lib/auth";
import { formatRupiah } from "../../lib/data";

export default async function AccountPage() {
  const user = await requireUser("/account");
  const [profile, orders] = await Promise.all([getUserProfile(user.id), getAccountOrders("/account")]);
  const active = orders.filter((order) => order.fulfillmentStatus !== "Selesai" && order.fulfillmentStatus !== "Dibatalkan");
  const reservations = active.filter((order) => order.type === "reservation");
  const paidTotal = orders.filter((order) => order.paymentStatus === "Dibayar").reduce((sum, order) => sum + order.total, 0);
  const latest = active[0];
  return <><div className="account-heading"><div><p className="eyebrow">AKUN SAYA</p><h1>Halo, {profile?.full_name?.split(" ")[0] || user.email.split("@")[0]}.</h1><p>Cek pesanan, pembayaran, dan reservasi dari sini.</p></div><Link href="/shop" className="button button--solid">Belanja lagi</Link></div><div className="account-stats"><article><span>Pesanan aktif</span><strong>{active.length}</strong><small>{active.filter((order) => order.paymentStatus !== "Dibayar").length} menunggu pembayaran</small></article><article><span>Reservasi</span><strong>{reservations.length}</strong><small>Reservasi aktif</small></article><article><span>Total transaksi</span><strong>{formatRupiah(paidTotal)}</strong><small>Dari pembayaran terverifikasi</small></article></div><section className="account-active"><div className="account-section-title"><div><p className="eyebrow">PESANAN TERBARU</p><h2>Pesanan yang sedang diproses</h2></div><Link href="/account/orders">Lihat semua →</Link></div>{latest ? <article className="active-order"><div className="active-order__top"><span>{latest.id}</span><b>{latest.paymentStatus}</b></div><div className="active-order__body"><div className="order-product-icon">H&H</div><div><small>{latest.type === "reservation" ? "RESERVASI HEWAN" : "PESANAN"}</small><h3>{latest.itemName}</h3><p>Status: {latest.fulfillmentStatus}</p></div><strong>{formatRupiah(latest.total)}</strong></div><div className="active-order__actions"><Link href={`/account/orders/${latest.id}`}>Lihat detail</Link>{latest.paymentStatus !== "Dibayar" && <Link href={`/payment/${latest.id}`} className="button button--solid">Bayar sekarang</Link>}</div></article> : <div className="empty-state"><h2>Belum ada pesanan aktif.</h2><Link href="/shop">Mulai belanja →</Link></div>}</section></>;
}
