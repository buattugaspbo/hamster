import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "HOP & HAM Pet Boutique",
  description: "Butik hamster, kelinci, habitat, pakan, dan perlengkapan pilihan di Palembang—lihat kondisi nyata sebelum membawa pulang.",
  openGraph: {
    title: "HOP & HAM Pet Boutique",
    description: "Kenalan dulu, pahami kebutuhannya, lalu bawa pulang dengan yakin.",
    type: "website",
    url: siteUrl,
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "HOP & HAM Pet Boutique",
    description: "Kenalan dulu, pahami kebutuhannya, lalu bawa pulang dengan yakin.",
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
