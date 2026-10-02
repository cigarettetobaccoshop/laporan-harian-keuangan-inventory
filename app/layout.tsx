import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Laporan Harian — Keuangan & Inventory",
  description: "Dashboard laporan uang masuk, uang keluar, barang masuk, barang keluar, saldo bersih, stok dan audit.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
