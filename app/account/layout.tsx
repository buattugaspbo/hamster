import { ReactNode } from "react";
import { AccountShell } from "../../components/AccountShell";
import { Footer } from "../../components/Footer";
import { StoreHeader } from "../../components/StoreHeader";
import { getUserProfile, requireUser } from "../../lib/auth";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("/account");
  const profile = await getUserProfile(user.id);
  return <main><StoreHeader /><AccountShell name={profile?.full_name || user.email.split("@")[0]} email={user.email}>{children}</AccountShell><Footer /></main>;
}
