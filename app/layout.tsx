import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
