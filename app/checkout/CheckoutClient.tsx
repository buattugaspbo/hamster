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
import { formatRupiah, getAnimalSexStock, type AnimalSex } from "../../lib/data";
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
  const requestedSex = params.get("sex") === "Betina" ? "Betina" : "Jantan";
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [products, setProducts] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [provinces, setProvinces] = useState<RegionOption[]>([]);
  const [regencies, setRegencies] = useState<RegionOption[]>([]);
  const [districts, setDistricts] = useState<RegionOption[]>([]);
  const [villages, setVillages] = useState<RegionOption[]>([]);
  const [provinceCode, setProvinceCode] = useState("");
  const [regencyCode, setRegencyCode] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [villageCode, setVillageCode] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [shippingQuote, setShippingQuote] = useState<ShippingQuote | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(animalId ? "pickup" : "delivery");
  const [packingType, setPackingType] = useState<PackingType>("toples");

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
    const entries = animalId ? [{ id: animalId, quantity: 1, sex: requestedSex }] : cart;
    return entries.flatMap((entry) => {
      const product = products.find((item) => item.id === entry.id);
      if (!product) return [];
      const sex: AnimalSex | undefined = product.kind === "animal" ? (entry.sex === "Betina" ? "Betina" : "Jantan") : undefined;
      const maximum = sex ? getAnimalSexStock(product, sex) : product.stock;
      return [{ product, sex, quantity: Math.min(entry.quantity, maximum) }];
    });
  }, [animalId, cart, products, requestedSex]);
  const subtotal = selected.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const hasAnimal = selected.some(({ product }) => product.kind === "animal");
  const orderType = "order";
  const packingOrderType = hasAnimal ? "reservation" : "order";
  const isDelivery = deliveryMethod === "delivery";
  const deliveryEligible = canUseDelivery(subtotal);
  const shippingCost = isDelivery ? shippingQuote?.cost || 0 : 0;
  const packingCost = calculatePackingCost(packingOrderType, deliveryMethod, packingType);
  const grandTotal = subtotal + shippingCost + packingCost;

  const chooseDeliveryMethod = (method: DeliveryMethod) => {
    setDeliveryMethod(method);
    setError("");
    if (method === "pickup") setShippingQuote(null);
  };

  const selectProvince = async (code: string) => {
    setProvinceCode(code); setRegencyCode(""); setDistrictCode(""); setVillageCode(""); setPostalCode(""); setShippingQuote(null); setDistricts([]); setVillages([]);
    setRegencies(code ? await loadRegions("regency", code) : []);
  };

  const selectRegency = async (code: string) => {
    setRegencyCode(code); setDistrictCode(""); setVillageCode(""); setPostalCode(""); setShippingQuote(null); setShippingLoading(Boolean(code)); setVillages([]);
    try {
      const [districtRows] = await Promise.all([
        code ? loadRegions("district", code) : Promise.resolve([]),
      ]);
      setDistricts(districtRows);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Wilayah pengiriman gagal dimuat");
    } finally {
      setShippingLoading(false);
    }
  };

  const selectDistrict = async (code: string) => {
    setDistrictCode(code); setVillageCode(""); setPostalCode(""); setVillages([]); setShippingQuote(null); setError("");
    if (!code || !regencyCode) return;
    setShippingLoading(true);
    try {
      const villageRows = await loadRegions("village", code);
      setVillages(villageRows);
      const response = await fetch("/api/shipping/quote", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regencyCode, districtCode: code }),
      });
      const payload = await response.json() as { quote?: ShippingQuote; error?: string };
      if (!response.ok || !payload.quote) throw new Error(payload.error || "Ongkir tidak tersedia");
      setShippingQuote(payload.quote);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Ongkir gagal dihitung");
    } finally {
      setShippingLoading(false);
    }
  };

  const selectVillage = (code: string) => {
    setVillageCode(code);
    const village = villages.find((region) => region.code === code);
    if (village?.postalCode) setPostalCode(village.postalCode);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected.length || (isDelivery && (!shippingQuote || !deliveryEligible))) return;
    setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const destination = [form.get("address"), villages.find((region) => region.code === villageCode)?.name, districts.find((region) => region.code === districtCode)?.name, regencies.find((region) => region.code === regencyCode)?.name, provinces.find((region) => region.code === provinceCode)?.name, form.get("postal")].filter(Boolean).join(", ");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.get("name"), phone: form.get("phone"), email: form.get("email"),
          type: orderType,
          deliveryMethod,
          packingType: hasAnimal ? packingType : "standard",
          items: selected.map(({ product, quantity, sex }) => ({ productId: product.id, quantity, sex })),
          pickupAt: `${form.get("date")}T${form.get("time")}:00+07:00`,
          shippingAddress: isDelivery ? destination : "", regencyCode: isDelivery ? regencyCode : "", districtCode: isDelivery ? districtCode : "",
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
      <div className="checkout-heading"><div><p className="eyebrow">{hasAnimal ? "RESERVASI HEWAN" : "CHECKOUT PERLENGKAPAN"}</p><h1>{animalId ? `Reservasi ${selected[0]?.product.name || "hewan"}` : hasAnimal ? "Atur pesanan hewan" : "Selesaikan pesanan"}</h1></div><div className="checkout-steps"><b>1</b><span>Data & jadwal</span><i /><b>2</b><span>Pembayaran</span><i /><b>3</b><span>Selesai</span></div></div>
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
          {isDelivery && hasAnimal && <>
            <h2>Packing hewan</h2>
            <p className="packing-intro">Sebelum berangkat, toples berventilasi dicek dan dikunci oleh tim toko. Pilih pelindung tambahan bila perjalanan atau muatan berisiko.</p>
            <div className="packing-options">
              <label className={packingType === "toples" ? "active" : ""}><input type="radio" name="packing" value="toples" checked={packingType === "toples"} onChange={() => setPackingType("toples")} /><span><strong>Toples berventilasi</strong><small>Termasuk · aman untuk perjalanan terjadwal.</small></span></label>
              <label className={packingType === "kayu" ? "active" : ""}><input type="radio" name="packing" value="kayu" checked={packingType === "kayu"} onChange={() => setPackingType("kayu")} /><span><strong>Toples + pelindung kayu</strong><small>+{formatRupiah(8_000)} · lebih aman jika tertimpa barang lain.</small></span></label>
            </div>
          </>}
          {isDelivery && <>
            <h2>Alamat pengiriman</h2>
            <label>Nama jalan / lorong dan nomor rumah<textarea name="address" rows={3} required placeholder="Contoh: Jl. DI Panjaitan, Lorong …, No. …, RT/RW" /></label>
            <div className="form-row"><label>Provinsi<select required value={provinceCode} onChange={(event) => selectProvince(event.target.value)}><option value="">Pilih provinsi</option>{provinces.map((region) => <option value={region.code} key={region.code}>{region.name}</option>)}</select></label><label>Kabupaten / kota<select required disabled={!provinceCode} value={regencyCode} onChange={(event) => selectRegency(event.target.value)}><option value="">Pilih kabupaten / kota</option>{regencies.map((region) => <option value={region.code} key={region.code}>{region.name}</option>)}</select></label></div>
            <div className="form-row"><label>Kecamatan<select name="district" required disabled={!regencyCode || districts.length === 0} value={districtCode} onChange={(event) => void selectDistrict(event.target.value)}><option value="">{regencyCode && districts.length === 0 ? "Belum tersedia di wilayah ini" : "Pilih kecamatan"}</option>{districts.map((region) => <option value={region.code} key={region.code}>{region.name}</option>)}</select></label><label>Kelurahan<select required disabled={!districtCode || villages.length === 0} value={villageCode} onChange={(event) => selectVillage(event.target.value)}><option value="">{districtCode && villages.length === 0 ? "Belum tersedia" : "Pilih kelurahan"}</option>{villages.map((region) => <option value={region.code} key={region.code}>{region.name}</option>)}</select></label></div>
            <label>Kode pos<input name="postal" required inputMode="numeric" pattern="[0-9]{5}" value={postalCode} onChange={(event) => setPostalCode(event.target.value)} placeholder="30266" /></label>
            {regencyCode && districts.length === 0 && <p className="delivery-warning">Pengantaran otomatis belum tersedia di kota ini karena titik kecamatannya belum terpetakan. Pilih wilayah lain atau ambil di toko.</p>}
            <div className="shipping-calculator" aria-live="polite"><div><span>Ongkir pengantaran</span>{shippingLoading ? <strong>Menghitung…</strong> : shippingQuote ? <strong>{formatRupiah(shippingQuote.cost)}</strong> : <strong>Pilih kecamatan</strong>}</div><small>Ongkir dihitung otomatis setelah kecamatan dipilih.</small></div>
          </>}
          <h2>{isDelivery ? "Jadwal pengiriman" : "Jadwal pengambilan"}</h2>
          <div className="form-row"><label>Pilih tanggal<input name="date" required type="date" min={new Date().toISOString().slice(0, 10)} /></label><label>Pilih waktu<select name="time" required defaultValue=""><option value="" disabled>Pilih slot</option><option>10:00</option><option>13:00</option><option>15:00</option><option>17:00</option></select></label></div>
          <label>Catatan untuk tim kami<textarea name="notes" rows={4} placeholder="Tulis catatan jika ada" /></label>
      {hasAnimal && <label className="check-line"><input type="checkbox" required /><span>Saya sudah membaca panduan perawatan dasar dan memahami cara membawa hewan dengan aman.</span></label>}
        </section>
        <aside className="checkout-summary"><h2>Ringkasan</h2>{selected.map(({ product, quantity, sex }) => <div className="summary-item" key={`${product.id}-${sex || "default"}`}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={product.image} alt={product.name} /><div><strong>{product.name}</strong><span>{quantity} × {sex || product.breed || product.category}</span></div><b>{formatRupiah(product.price * quantity)}</b></div>)}<div className="summary-shipping"><span>Subtotal</span><strong>{formatRupiah(subtotal)}</strong><span>{isDelivery ? "Ongkir" : "Pengambilan"}</span><strong>{isDelivery ? shippingQuote ? formatRupiah(shippingCost) : "—" : "Gratis"}</strong>{packingCost > 0 && <><span>Pelindung kayu</span><strong>{formatRupiah(packingCost)}</strong></>}</div><div className="summary-total"><span>Total</span><strong>{formatRupiah(grandTotal)}</strong></div><p className="reservation-note">Tim toko mengecek stok, packing, dan total sebelum QRIS dibuat.</p><button disabled={loading || !selected.length || (isDelivery && (!shippingQuote || !deliveryEligible))} className="button button--solid" type="submit">{loading ? "Membuat pesanan…" : "Lanjut ke pembayaran"}</button></aside>
      </form>
    </div>
  );
}
