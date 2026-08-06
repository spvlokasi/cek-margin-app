export interface Produk {
  no?: number;
  kode: string;
  nama: string;
  principle?: string;
  namaPrinciple?: string;
  supplier?: string;
  namaSupplier?: string;
  kategori?: string;
  hpp: number;
  hrg1: number;
  hrg2: number;
  hrg3: number;
}

export interface StokItem {
  id?: string;
  no?: number;
  kodeCabang: string;
  namaCabang: string;
  kode: string;
  nama: string;
  stok: number;
  hpp: number;
  nilai: number;
  rl1: number;
  persenH1: number;
  rl2: number;
  persenH2: number;
  rl3: number;
  persenH3: number;
  updatedAt: string;
}

export interface Cabang {
  kode: string;
  nama: string;
  wilayah?: string;
  password?: string;
}

export type UserRole = 'admin' | 'cabang';

export interface UserSession {
  isLoggedIn: boolean;
  role: UserRole;
  kodeCabang: string; // 'ALL' if admin, or specific branch code like 'CBG-001'
  namaCabang: string;
  username?: string;
}
