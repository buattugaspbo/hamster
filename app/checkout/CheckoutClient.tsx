"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { clearCart, readCart, type CartEntry } from "../../lib/cart";
import {
  MINIMUM_DELIVERY_SUBTOTAL,
  calculatePackingCost,
  canUseDelivery,
  type DeliveryMethod,
  type PackingType,
} from "../../lib/checkout";
import type { CatalogItem } from "../../lib/data";
import { formatRupiah } from "../../lib/data";
import type { RegionOption } from "../../lib/regions";

type ShippingQuote = {
  origin: { name: string };
  destination: RegionOption;
  distanceKm: number;
  cost: number;
  ratePerKm: number;
};

async function loadRegions(level: string, parent?: string) {
  const query = new URLSearchParams({ level });
  if (parent) query.set("parent", parent);
  const response = await fetch(`/api/regions?${query}`);
  if (!response.ok) return [];
  const payload = await response.json() as { data?: RegionOption[] };
  return payload.data || [];
}

export function CheckoutClient() {
  const params = useSearchParams();
  const router = useRouter();
  const animalId = params.get("animal");
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [products, setProducts] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [provinces, setProvinces] = useState<RegionOption[]>([]);
  const [regencies, setRegencies] = useState<RegionOption[]>([]);
  const [districts, setDistricts] = useState<RegionOption[]>([]);
  const [provinceCode, setProvinceCode] = useState("");
  const [regencyCode, setRegencyCode] = useState("");
  const [shippingQuote, setShippingQuote] = useState<ShippingQuote | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(animalId ? "pickup" : "delivery");
  const [packingType, setPackingType] = useState<PackingType>(animalId ? "toples" : "standard");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setCart(readCart()));
    Promise.all([
      fetch("/api/products").then((response) => response.json() as Promise<{ products?: CatalogItem[] }>),
      loadRegions("province"),
    ]).then(([catalog, regionRows]) => {
      setProducts(catalog.products || []);
      setProvinces(regionRows as RegionOption[]);
    }).catch(() => setError("Checkout belum dapat dimuat.")).finally(() => setPageLoading(false));
    return () => window.cancelAnimationFrame(frame);
  }, [animalId]);

  const selected = useMemo(() => {
    const entries = animalId ? [{ id: animalId, quantity: 1 }] : cart;
    return entries.flatMap((entry) => {
      const product = products.find((item) => item.id === entry.id);
      return product ? [{ product, quantity: entry.quantity }] : [];
    });
  }, [animalId, cart, products]);
  const subtotal = selected.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isDelivery = deliveryMethod === "delivery";
  const deliveryEligible = canUseDelivery(subtotal);
  const shippingCost = isDelivery ? shippingQuote?.cost || 0 : 0;
  const packingCost = calculatePackingCost(animalId ? "reservation" : "order", deliveryMethod, packingType);
  const grandTotal = subtotal + shippingCost + packingCost;

  const chooseDeliveryMethod = (method: DeliveryMethod) => {
    setDeliveryMethod(method);
    setError("");
    if (method === "pickup") setShippingQuote(null);
  };

  const selectProvince = async (code: string) => {
    setProvinceCode(code); setRegencyCode(""); setShippingQuote(null); setDistricts([]);
    setRegencies(code ? await loadRegions("regency", code) : []);
  };

  const selectRegency = async (code: string) => {
    setRegencyCode(code); setShippingQuote(null); setShippingLoading(Boolean(code));
    try {
      const [districtRows, response] = await Promise.all([
        code ? loadRegions("district", code) : Promise.resolve([]),
        code ? fetch("/api/shipping/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ regencyCode: code }) }) : null,
      ]);
      setDistricts(districtRows);
      if (response) {
        const payload = await response.json() as { quote?: ShippingQuote; error?: string };
        if (!response.ok) throw new Error(payload.error || "Ongkir tidak tersedia");
        setShippingQuote(payload.quote || null);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Ongkir gagal dihitung");
    } finally {
      setShippingLoading(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected.length || (isDelivery && (!shippingQuote || !deliveryEligible))) return;
    setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const destination = [form.get("address"), form.get("district"), regencies.find((region) => region.code === regencyCode)?.name, provinces.find((region) => region.code === provinceCode)?.name, form.get("postal")].filter(Boolean).join(", ");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.get("name"), phone: form.get("phone"), email: form.get("email"),
          type: animalId ? "reservation" : "order",
          deliveryMethod,
          packingType: animalId ? packingType : "standard",
          items: selected.map(({ product, quantity }) => ({ productId: product.id, quantity })),
          pickupAt: `${form.get("date")}T${form.get("time")}:00+07:00`,
          shippingAddress: isDelivery ? destination : "", regencyCode: isDelivery ? regencyCode : "",
          notes: form.get("notes"),
        }),
      });
      const payload = await response.json() as { order?: { id: string }; paymentToken?: string; error?: string };
      if (!response.ok || !payload.order) throw new Error(payload.error || "Pesanan gagal dibuat");
      if (!animalId) clearCart();
      const query = payload.paymentToken ? `?token=${encodeURIComponent(payload.paymentToken)}` : "";
      router.push(`/payment/${payload.order.id}${query}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Pesanan gagal dibuat");
      setLoading(false);
    }
  };

  if (pageLoading) return <div className="page-loading">Menyiapkan checkout…</div>;

  return (
    <div className="checkout-page content-shell">
      <div className="checkout-heading"><div><p className="eyebrow">{animalId ? "RESERVASI HEWAN" : "CHECKOUT PERLENGKAPAN"}</p><h1>{animalId ? `Reservasi ${selected[0]?.product.name || "hewan"}` : "Selesaikan pesanan"}</h1></div><div className="checkout-steps"><b>1</b><span>Data & jadwal</span><i /><b>2</b><span>Pembayaran</span><i /><b>3</b><span>Selesai</span></div></div>
      <div className="checkout-account-note"><span>○</span><p><strong>Sudah punya akun?</strong> Masuk supaya pesanan ini muncul di halaman akun.</p><a href="/login?next=/checkout">Masuk</a></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <form className="checkout-grid" onSubmit={submit}>
        <section className="checkout-form">
          <h2>Data diri</h2>
          <label>Nama lengkap<input name="name" required minLength={2} placeholder="Masukkan nama lengkap" /></label>
          <div className="form-row"><label>Nomor WhatsApp<input name="phone" required inputMode="tel" placeholder="08xxxxxxxxxx" /></label><label>Email <small>(opsional)</small><input name="email" type="email" placeholder="nama@email.com" /></label></div>
          <h2>Mau diterima bagaimana?</h2>
          <div className="delivery-methods">
            <button type="button" className={deliveryMethod === "pickup" ? "active" : ""} onClick={() => chooseDeliveryMethod("pickup")}><strong>Ambil di toko</strong><span>Tanpa ongkir, ambil sesuai jadwal.</span></button>
            <button type="button" className={deliveryMethod === "delivery" ? "active" : ""} onClick={() => chooseDeliveryMethod("delivery")}><strong>Diantar</strong><span>Minimal belanja {formatRupiah(MINIMUM_DELIVERY_SUBTOTAL)}.</span></button>
          </div>
          {isDelivery && !deliveryEligible && <p className="delivery-warning">Tambah belanja {formatRupiah(MINIMUM_DELIVERY_SUBTOTAL - subtotal)} lagi supaya pesanan bisa diantar.</p>}
          {isDelivery && animalId && <>
            <h2>Packing hewan</h2>
            <p className="packing-intro">Sebelum berangkat, toples berventilasi dicek dan dikunci oleh tim toko. Pilih pelindung tambahan bila perjalanan atau muatan berisiko.</p>
            <div className="packing-options">
              <label className={packingType === "toples" ? "active" : ""}><input type="radio" name="packing" value="toples" checked={packingType === "toples"} onChange={() => setPackingType("toples")} /><span><strong>Toples berventilasi</strong><small>Termasuk · aman untuk perjalanan terjadwal.</small></span></label>
              <label className={packingType === "kayu" ? "active" : ""}><input type="radio" name="packing" value="kayu" checked={packingType === "kayu"} onChange={() => setPackingType("kayu")} /><span><strong>Toples + pelindung kayu</strong><small>+{formatRupiah(8_000)} · lebih aman jika tertimpa barang lain.</small></span></label>
            </div>
          </>}
          {isDelivery && <>
            <h2>Alamat pengiriman</h2>
            <label>Alamat lengkap<textarea name="address" rows={3} required placeholder="Nama jalan, nomor rumah, RT/RW" /></label>
            <div className="form-row"><label>Provinsi<select required value={provinceCode} onChange={(event) => selectProvince(event.target.value)}><option value="">Pilih provinsi</option>{provinces.map((region) => <option value={region.code} key={region.code}>{region.name}</option>)}</select></label><label>Kabupaten / kota<select required disabled={!provinceCode} value={regencyCode} onChange={(event) => selectRegency(event.target.value)}><option value="">Pilih kabupaten / kota</option>{regencies.map((region) => <option value={region.code} key={region.code}>{region.name}</option>)}</select></label></div>
            <div className="form-row"><label>Kecamatan{districts.length ? <select name="district" required defaultValue=""><option value="">Pilih kecamatan</option>{districts.map((region) => <option value={region.name} key={region.code}>{region.name}</option>)}</select> : <input name="district" required placeholder="Masukkan kecamatan" />}</label><label>Kode pos<input name="postal" required inputMode="numeric" placeholder="30137" /></label></div>
            <div className="shipping-calculator" aria-live="polite"><div><span>Ongkir dari Palembang</span>{shippingLoading ? <strong>Menghitung…</strong> : shippingQuote ? <strong>{formatRupiah(shippingQuote.cost)}</strong> : <strong>Pilih kota tujuan</strong>}</div>{shippingQuote && <p>Mulai dari Rp10.000, lalu ditambah {shippingQuote.distanceKm.toLocaleString("id-ID")} km × Rp49. Hasilnya dibulatkan ke Rp500 terdekat.</p>}<small>Jarak dihitung dari pusat kota Palembang ke kota tujuan.</small></div>
          </>}
          <h2>{isDelivery ? "Jadwal pengiriman" : "Jadwal pengambilan"}</h2>
          <div className="form-row"><label>Pilih tanggal<input name="date" required type="date" min={new Date().toISOString().slice(0, 10)} /></label><label>Pilih waktu<select name="time" required defaultValue=""><option value="" disabled>Pilih slot</option><option>10:00</option><option>13:00</option><option>15:00</option><option>17:00</option></select></label></div>
          <label>Catatan untuk tim kami<textarea name="notes" rows={4} placeholder="Tulis catatan jika ada" /></label>
          {animalId && <label className="check-line"><input type="checkbox" required /><span>Saya sudah membaca panduan perawatan dasar dan memahami cara membawa hewan dengan aman.</span></label>}
        </section>
        <aside className="checkout-summary"><h2>Ringkasan</h2>{selected.map(({ product, quantity }) => <div className="summary-item" key={product.id}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={product.image} alt={product.name} /><div><strong>{product.name}</strong><span>{quantity} × {product.breed || product.category}</span></div><b>{formatRupiah(product.price * quantity)}</b></div>)}<div className="summary-shipping"><span>Subtotal</span><strong>{formatRupiah(subtotal)}</strong><span>{isDelivery ? "Ongkir" : "Pengambilan"}</span><strong>{isDelivery ? shippingQuote ? formatRupiah(shippingCost) : "—" : "Gratis"}</strong>{packingCost > 0 && <><span>Pelindung kayu</span><strong>{formatRupiah(packingCost)}</strong></>}</div><div className="summary-total"><span>Total</span><strong>{formatRupiah(grandTotal)}</strong></div><p className="reservation-note">Tim toko mengecek stok, packing, dan total sebelum QRIS dibuat.</p><button disabled={loading || !selected.length || (isDelivery && (!shippingQuote || !deliveryEligible))} className="button button--solid" type="submit">{loading ? "Membuat pesanan…" : "Lanjut ke pembayaran"}</button></aside>
      </form>
    </div>
  );
}
