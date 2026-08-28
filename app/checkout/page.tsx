import { Suspense } from "react";
import { Footer } from "../../components/Footer";
import { StoreHeader } from "../../components/StoreHeader";
import { CheckoutClient } from "./CheckoutClient";

export default function CheckoutPage() {
  return <main><StoreHeader /><Suspense fallback={<div className="page-loading">Menyiapkan checkout…</div>}><CheckoutClient /></Suspense><Footer /></main>;
}
