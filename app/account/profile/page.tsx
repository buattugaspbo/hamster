import { ProfileForm } from "../../../components/ProfileForm";
import { getUserProfile, requireUser } from "../../../lib/auth";

export default async function ProfilePage() {
  const user = await requireUser("/account/profile"); const profile = await getUserProfile(user.id) || {};
  return <><div className="account-heading"><div><p className="eyebrow">PENGATURAN AKUN</p><h1>Data diri</h1><p>Pastikan data ini sesuai untuk konfirmasi pesanan.</p></div></div><ProfileForm profile={profile} email={user.email} /></>;
}
