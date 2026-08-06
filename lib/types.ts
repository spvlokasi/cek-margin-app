export interface Produk {
  no?: number;
  kode: string;
  nama: string;
  principle?: string;
  namaPrinciple?: string;
  supplier?: string;
  namaSupplier?: string;
  kodeSupplier?: string;
  kategori?: string;
  hpp: number;
  hrg1: number;
  hrg2: number;
  hrg3: number;
  kodeCabang?: string;
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
  rl1?: number;
  persenH1?: number;
  rl2?: number;
  persenH2?: number;
  rl3?: number;
  persenH3?: number;
  updatedAt?: string;
}

export interface Cabang {
  kode: string; // User/Kode Cabang
  nama: string;
  wilayah?: string;
  password?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  nama: string;
  password?: string;
}

export interface CekMarginItem {
  no?: number;
  kode: string;
  nama: string;
  namaSupplier: string;
  stok: number;
  hpp: number;
  hrg1: number;
  mrg1: number;
  persen1: number;
  hrg2: number;
  mrg2: number;
  persen2: number;
  hrg3: number;
  mrg3: number;
  persen3: number;
  kodeCabang: string;
  namaCabang: string;
}

export type UserRole = 'admin' | 'cabang';

export interface UserSession {
  isLoggedIn: boolean;
  role: UserRole;
  kodeCabang: string;
  namaCabang: string;
  username?: string;
}
