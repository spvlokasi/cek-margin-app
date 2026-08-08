const fs = require("fs");
const tsContent = fs.readFileSync("lib/sampleData.ts", "utf8");
const match = tsContent.match(/export const MOCK_CABANG[^=]*=\s*(\[[\s\S]*?\]);/);
if (match) {
  const branches = eval(match[1]);

  // GUDANG A (Auth & Stok)
  let sqlA = `
-- GUDANG A (Auth & Stok)
-- 1. Create table admin_users
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    nama TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create table cabang
CREATE TABLE IF NOT EXISTS public.cabang (
    kode_cabang TEXT PRIMARY KEY,
    nama_cabang TEXT NOT NULL,
    wilayah TEXT,
    password TEXT
);

-- 3. Create table stok (Unified)
CREATE TABLE IF NOT EXISTS public.stok (
    kode_cabang TEXT NOT NULL,
    kode_produk TEXT NOT NULL,
    nama_produk TEXT,
    stok NUMERIC DEFAULT 0,
    hpp NUMERIC DEFAULT 0,
    nilai NUMERIC DEFAULT 0,
    rl1 NUMERIC DEFAULT 0,
    persen_h1 NUMERIC DEFAULT 0,
    rl2 NUMERIC DEFAULT 0,
    persen_h2 NUMERIC DEFAULT 0,
    rl3 NUMERIC DEFAULT 0,
    persen_h3 NUMERIC DEFAULT 0,
    PRIMARY KEY (kode_cabang, kode_produk)
);

-- 4. Insert default admins
INSERT INTO public.admin_users (id, username, nama, password) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin', 'Super Admin Pusat', 'admin123'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'spv', 'SPV Bisnis', 'spv123')
ON CONFLICT (username) DO NOTHING;

-- 5. Insert branches
`;
  
  for (const b of branches) {
    const safeNama = b.nama.replace(/'/g, "''");
    const pwd = b.password || b.kode;
    sqlA += `INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('${b.kode}', '${safeNama}', '${b.wilayah}', '${pwd}') ON CONFLICT (kode_cabang) DO NOTHING;\n`;
  }
  
  fs.writeFileSync("setup_gudang_a.sql", sqlA);
  console.log("setup_gudang_a.sql generated successfully.");

  // GUDANG B (Produk)
  let sqlB = `
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
`;

  fs.writeFileSync("setup_gudang_b.sql", sqlB);
  console.log("setup_gudang_b.sql generated successfully.");
}
