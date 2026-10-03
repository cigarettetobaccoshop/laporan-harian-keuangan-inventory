import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Laporan Harian — Keuangan & Inventory", template: "%s | Laporan Harian" },
  description: "Sistem operasional untuk laporan keuangan, inventory, analisis, kontrol stok, dan audit harian.",
  applicationName: "Laporan Harian",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
