import { StoreHeader } from "../../../components/StoreHeader";
import { PaymentClient } from "./PaymentClient";
import { Suspense } from "react";

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <main><StoreHeader /><Suspense fallback={<div className="page-loading">Menyiapkan QRIS…</div>}><PaymentClient id={id} /></Suspense></main>;
}
