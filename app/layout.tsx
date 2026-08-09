import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cek Margin - Analisis Stok & Margin Cabang",
  description: "Aplikasi pengelolaan stok, analisis margin, dan upload Excel multi-cabang terintegrasi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-slate-50 text-slate-800 antialiased selection:bg-emerald-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
