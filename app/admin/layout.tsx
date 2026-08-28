import { AdminShell } from "../../components/AdminShell";
import { requireAdmin } from "../../lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireAdmin("/admin");
  return <AdminShell name={profile.full_name || user.email.split("@")[0]}>{children}</AdminShell>;
}
