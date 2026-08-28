import "server-only";
import { requireUser } from "./auth";
import { serializeOrder } from "./serializers";
import { createClient } from "./supabase/server";

export async function getAccountOrders(returnTo: string) {
  await requireUser(returnTo);
  const supabase = await createClient();
  const { data, error } = await supabase.from("orders")
    .select("*, order_items(*)").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map((row) => serializeOrder(row));
}

export async function getAccountOrder(id: string) {
  await requireUser(`/account/orders/${id}`);
  const supabase = await createClient();
  const { data, error } = await supabase.from("orders")
    .select("*, order_items(*)").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? serializeOrder(data) : null;
}
