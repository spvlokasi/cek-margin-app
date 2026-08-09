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
      <body className={`${inter.className} antialiased selection:bg-emerald-500 selection:text-white`} style={{background: 'linear-gradient(135deg, #e8f5e9 0%, #f1fdf4 40%, #e0f2f1 100%)', minHeight: '100vh'}}>
        {children}
      </body>
    </html>
  );
}
