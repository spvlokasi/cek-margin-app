const fs = require("fs");
const tsContent = fs.readFileSync("lib/sampleData.ts", "utf8");
const match = tsContent.match(/export const MOCK_CABANG[^=]*=\s*(\[[\s\S]*?\]);/);
if (match) {
  const branches = eval(match[1]);
  let sql = `
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

-- 3. Insert default admins
INSERT INTO public.admin_users (id, username, nama, password) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin', 'Super Admin Pusat', 'admin123'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'spv', 'SPV Bisnis', 'spv123')
ON CONFLICT (username) DO NOTHING;

-- 4. Insert 78 branches
`;
  
  for (const b of branches) {
    const safeNama = b.nama.replace(/'/g, "''");
    const pwd = b.password || b.kode;
    sql += `INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('${b.kode}', '${safeNama}', '${b.wilayah}', '${pwd}') ON CONFLICT (kode_cabang) DO NOTHING;\n`;
  }
  
  fs.writeFileSync("setup.sql", sql);
  console.log("setup.sql generated successfully.");
}
