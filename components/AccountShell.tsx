"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const links = [
  ["/account", "⌂", "Ringkasan"],
  ["/account/orders", "□", "Pesanan & reservasi"],
  ["/account/profile", "○", "Data diri"],
  ["/account/addresses", "⌖", "Alamat"],
];

export function AccountShell({ children, name, email }: { children: ReactNode; name: string; email: string }) {
  const pathname = usePathname();
  const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="account-layout content-shell">
      <aside className="account-sidebar">
        <div className="account-person"><span>{initials}</span><div><strong>{name}</strong><small>{email}</small></div></div>
        <nav>{links.map(([href, icon, label]) => <Link key={href} href={href} className={pathname === href || (href !== "/account" && pathname.startsWith(href)) ? "active" : ""}><i>{icon}</i>{label}</Link>)}</nav>
        <form action="/auth/signout" method="post"><button className="account-logout">Keluar dari akun</button></form>
      </aside>
      <section className="account-content">{children}</section>
    </div>
  );
}
