import { Footer } from "../../components/Footer";
import { StoreHeader } from "../../components/StoreHeader";
import { CartClient } from "./CartClient";

export default function CartPage() {
  return <main><StoreHeader /><CartClient /><Footer /></main>;
}
