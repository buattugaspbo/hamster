"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

const links = [
  ["/admin", "Ringkasan", "⌂"],
  ["/admin/inventory", "Hewan & Produk", "◈"],
  ["/admin/orders", "Pesanan & Reservasi", "▣"],
  ["/admin/content", "Film Homepage", "◇"],
];

export function AdminShell({ children, name }: { children: ReactNode; name: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="admin-app">
      <aside className={`admin-sidebar ${open ? "admin-sidebar--open" : ""}`}>
        <Link href="/admin" className="admin-brand"><strong>HOP & HAM</strong><span>ADMIN</span></Link>
        <nav>
          {links.map(([href, label, icon]) => <Link href={href} key={href} className={pathname === href ? "active" : ""} onClick={() => setOpen(false)}><i>{icon}</i><span>{label}</span></Link>)}
          <Link href="/shop"><i>↗</i><span>Lihat toko</span></Link>
        </nav>
        <div className="admin-profile"><span>{initials}</span><div><strong>{name}</strong><small>Administrator</small></div></div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar"><button onClick={() => setOpen((value) => !value)}>☰</button><div><strong>Halo, {name}</strong><span>{new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(new Date())}</span></div><div className="admin-top-actions"><span className="notification">3</span><b>{initials}</b></div></header>
        {children}
      </div>
    </div>
  );
}
