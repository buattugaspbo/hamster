import type { Metadata } from "next";
import { ChatWidget } from "../components/ChatWidget";
import "./globals.css";

// Domain utama dipakai sebagai fallback agar tautan saat dibagikan tidak pernah
// mengarah ke localhost jika environment Vercel belum memuat variabel ini.
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const siteUrl = configuredSiteUrl && !configuredSiteUrl.includes("localhost")
  ? configuredSiteUrl
  : "https://hopandham.web.id";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "HOP & HAM | Hamster, Kelinci & Perlengkapan Palembang",
  description: "Toko hamster, kelinci, kandang, pakan, dan perlengkapan di Palembang. Cek stok dan pesan langsung dari website.",
  openGraph: {
    title: "HOP & HAM | Toko Hamster & Kelinci Palembang",
    description: "Cek stok hamster, kelinci, kandang, pakan, dan perlengkapannya.",
    type: "website",
    url: siteUrl,
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "HOP & HAM | Toko Hamster & Kelinci Palembang",
    description: "Cek stok hamster, kelinci, kandang, pakan, dan perlengkapannya.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}<ChatWidget /></body>
    </html>
  );
}
