
-- GUDANG B (Produk)
-- 1. Create table produk (Unified)
CREATE TABLE IF NOT EXISTS public.produk (
    kode_cabang TEXT NOT NULL,
    kode_produk TEXT NOT NULL,
    nama_produk TEXT,
    kategori TEXT,
    principle TEXT,
    nama_principle TEXT,
    supplier TEXT,
    nama_supplier TEXT,
    hpp NUMERIC DEFAULT 0,
    hrg1 NUMERIC DEFAULT 0,
    hrg2 NUMERIC DEFAULT 0,
    hrg3 NUMERIC DEFAULT 0,
    PRIMARY KEY (kode_cabang, kode_produk)
);
