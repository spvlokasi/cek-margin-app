
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
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M1002', 'Basmalah Cabang Sepuluh', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M1003', 'Basmalah Cabang Geger', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M1004', 'Basmalah Cabang Arosbaya', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M1006', 'Basmalah Cabang Blega', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M1007', 'Basmalah Cabang Tonaan', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M1009', 'Basmalah Cabang Trageh', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M1010', 'Basmalah Cabang Kwanyar', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M1011', 'Basmalah Cabang Kamal', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M1012', 'Basmalah Cabang Patemon', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M1013', 'Basmalah Cabang Tanah Merah 02', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M1014', 'Basmalah Cabang Klampis', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M1015', 'Basmalah Cabang Galis', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M1016', 'Basmalah Cabang Socah', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M1017', 'Basmalah Cabang Trogan', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M1018', 'Basmalah Cabang Suramadu', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M1019', 'Basmalah Cabang Tanjung Bumi 02', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M1020', 'Basmalah Cabang Tanah Merah 01', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M1021', 'Basmalah Cabang Modung', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M1022', 'Basmalah Cabang Jaddih 02', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M1023', 'Basmalah Cabang Paka''an', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M1024', 'Basmalah Cabang Martajasah', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M1025', 'Basmalah Cabang Tengket', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M1026', 'Basmalah Cabang Tlangoh', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M2001', 'Basmalah Cabang Omben', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M2003', 'Basmalah Cabang Tamberuh', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M2004', 'Basmalah Cabang Camplong', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M2005', 'Basmalah Cabang Ketapang', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M2006', 'Basmalah Cabang Karang Penang', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M2008', 'Basmalah Cabang Lempong', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M2009', 'Basmalah Cabang Mandangin', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M2010', 'Basmalah Cabang Bungkak', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M2012', 'Basmalah Cabang Torjun', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M2013', 'Basmalah Cabang Sokobanah 2', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M2014', 'Basmalah Cabang Kedungdung', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M2015', 'Basmalah Cabang Karang Penang 02', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M2017', 'Basmalah Cabang Sampang Kota', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M2018', 'Basmalah Cabang Camplong 02', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M2019', 'Basmalah Cabang Jatrah Timur', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M2020', 'Basmalah Cabang Robatal 02', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M3001', 'Basmalah Cabang Pamekasan Kota', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M3002', 'Basmalah Cabang Pakong', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M3003', 'Basmalah Cabang Batu Bintang', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M3004', 'Basmalah Cabang Tlanakan', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M3005', 'Basmalah Cabang Pasean', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M3006', 'Basmalah Cabang Pegantenan', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M3007', 'Basmalah Cabang Waru 01', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M3008', 'Basmalah Cabang Larangan', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M3009', 'Basmalah Cabang Palengaan', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M3010', 'Basmalah Cabang Waru 02', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M3011', 'Basmalah Cabang Blumbungan', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M3012', 'Basmalah Cabang Proppo', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M3013', 'Basmalah Cabang Panempan', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M3014', 'Basmalah Cabang Jung Cangcang', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M3015', 'Basmalah Cabang Trasak', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M3016', 'Basmalah Cabang Kadur', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M3017', 'Basmalah Cabang Bugih', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M3018', 'Basmalah Cabang Bugih 02', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M3019', 'Basmalah Cabang Pademawu', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M3020', 'Basmalah Cabang Bandungan', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M3021', 'Basmalah Cabang Sotabar', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M4001', 'Basmalah Cabang Lenteng', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M4002', 'Basmalah Cabang Sumenep Kota', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M4003', 'Basmalah Cabang Ganding', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M4004', 'Basmalah Cabang Ambunten', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M4005', 'Basmalah Cabang Pasongsongan', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M4008', 'Basmalah Cabang Banasareh', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M4009', 'Basmalah Cabang Bluto', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M4010', 'Basmalah Cabang Prenduan', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M4011', 'Basmalah Cabang Manding', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M4013', 'Basmalah Cabang Marengan', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M4014', 'Basmalah Cabang Batuan', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M4015', 'Basmalah Cabang Legung', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M4016', 'Basmalah Cabang Kalianget', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('M4017', 'Basmalah Cabang Adirasa', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('W1001', 'Basmalah Cabang Sidayu', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('L1002', 'Basmalah Cabang Bulak Banteng', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
INSERT INTO public.cabang (kode_cabang, nama_cabang, wilayah, password) VALUES ('L1003', 'Basmalah Cabang DAS Surabaya', 'Pusat', 'M1002') ON CONFLICT (kode_cabang) DO NOTHING;
