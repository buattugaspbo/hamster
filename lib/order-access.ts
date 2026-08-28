import "server-only";
import { getAuthenticatedUser, isCurrentUserAdmin } from "./auth";
import { createAdminClient } from "./supabase/admin";

export async function getAccessibleOrder(id: string, token?: string | null) {
  const { data, error } = await createAdminClient()
    .from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const user = await getAuthenticatedUser();
  const allowed = Boolean(
    (token && token === data.payment_token)
      || (user && user.id === data.user_id)
      || (user && await isCurrentUserAdmin()),
  );
  return allowed ? data : null;
}
