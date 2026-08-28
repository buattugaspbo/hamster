import { Suspense } from "react";
import { Footer } from "../../components/Footer";
import { StoreHeader } from "../../components/StoreHeader";
import { ShopClient } from "./ShopClient";
import { getCatalog } from "../../lib/catalog";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const items = await getCatalog();
  return (
    <main>
      <StoreHeader />
      <Suspense fallback={<div className="page-loading">Menyiapkan katalog…</div>}>
        <ShopClient items={items} />
      </Suspense>
      <Footer />
    </main>
  );
}
