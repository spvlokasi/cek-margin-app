import { Cabang, Produk, StokItem, UserSession } from './types';
import { MOCK_CABANG, MOCK_PRODUK, MOCK_STOK } from './sampleData';
import { supabase } from './supabase';

const STORAGE_KEYS = {
  PRODUK: 'cek_margin_produk_v1',
  STOK: 'cek_margin_stok_v1',
  CABANG: 'cek_margin_cabang_v1',
  SESSION: 'cek_margin_session_v1',
  ADMIN_PASS: 'cek_margin_admin_pass_v1',
};

export function getAdminPassword(): string {
  if (typeof window === 'undefined') return 'admin123';
  return localStorage.getItem(STORAGE_KEYS.ADMIN_PASS) || 'admin123';
}

export function updateAdminPassword(newPassword: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ADMIN_PASS, newPassword);
}

export function getInitialSession(): UserSession {
  if (typeof window === 'undefined') {
    return { isLoggedIn: true, role: 'admin', kodeCabang: 'ALL', namaCabang: 'Semua Cabang (Admin)', username: 'admin' };
  }
  const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.isLoggedIn === 'boolean') return parsed;
    } catch {}
  }
  return { isLoggedIn: true, role: 'admin', kodeCabang: 'ALL', namaCabang: 'Semua Cabang (Admin)', username: 'admin' };
}

export function saveSession(session: UserSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
}

export function logoutUser(): UserSession {
  const emptySession: UserSession = {
    isLoggedIn: false,
    role: 'cabang',
    kodeCabang: '',
    namaCabang: '',
    username: '',
  };
  saveSession(emptySession);
  return emptySession;
}

export function getCabangList(): Cabang[] {
  if (typeof window === 'undefined') return MOCK_CABANG;
  const saved = localStorage.getItem(STORAGE_KEYS.CABANG);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  localStorage.setItem(STORAGE_KEYS.CABANG, JSON.stringify(MOCK_CABANG));
  return MOCK_CABANG;
}

export function addCabang(newCabang: Cabang): Cabang[] {
  const current = getCabangList();
  const exists = current.find(c => c.kode.toUpperCase() === newCabang.kode.toUpperCase());
  let updated: Cabang[];
  if (exists) {
    updated = current.map(c => c.kode.toUpperCase() === newCabang.kode.toUpperCase() ? { ...c, ...newCabang } : c);
  } else {
    updated = [...current, { ...newCabang, password: newCabang.password || '123' }];
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CABANG, JSON.stringify(updated));
  }

  // Async sync to Supabase cabang table
  supabase.from('cabang').upsert({
    kode_cabang: newCabang.kode,
    nama_cabang: newCabang.nama,
    wilayah: newCabang.wilayah || 'Jawa Timur',
    password: newCabang.password || '123',
  }).then();

  return updated;
}

/**
 * Bulk add up to 400 branches at once!
 */
export function bulkAddCabang(newCabangList: Cabang[]): Cabang[] {
  let current = getCabangList();
  const map = new Map<string, Cabang>();
  current.forEach(c => map.set(c.kode.toUpperCase(), c));

  newCabangList.forEach(nc => {
    const key = nc.kode.toUpperCase();
    const existing = map.get(key);
    map.set(key, {
      kode: nc.kode,
      nama: nc.nama,
      wilayah: nc.wilayah || existing?.wilayah || 'Jawa Timur',
      password: nc.password || existing?.password || '123',
    });
  });

  const updated = Array.from(map.values());
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CABANG, JSON.stringify(updated));
  }

  // Async sync bulk to Supabase
  const dbRows = updated.map(c => ({
    kode_cabang: c.kode,
    nama_cabang: c.nama,
    wilayah: c.wilayah,
    password: c.password || '123',
  }));
  supabase.from('cabang').upsert(dbRows).then();

  return updated;
}

export function updateBranchPassword(kodeCabang: string, newPassword: string): boolean {
  const current = getCabangList();
  const target = current.find(c => c.kode.toUpperCase() === kodeCabang.toUpperCase());
  if (!target) return false;

  const updated = current.map(c => c.kode.toUpperCase() === kodeCabang.toUpperCase() ? { ...c, password: newPassword } : c);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CABANG, JSON.stringify(updated));
  }

  supabase.from('cabang').update({ password: newPassword }).eq('kode_cabang', kodeCabang).then();
  return true;
}

export function getProdukList(): Produk[] {
  if (typeof window === 'undefined') return MOCK_PRODUK;
  const saved = localStorage.getItem(STORAGE_KEYS.PRODUK);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  localStorage.setItem(STORAGE_KEYS.PRODUK, JSON.stringify(MOCK_PRODUK));
  return MOCK_PRODUK;
}

export function getStokList(kodeCabangFilter?: string): StokItem[] {
  if (typeof window === 'undefined') return MOCK_STOK;
  const saved = localStorage.getItem(STORAGE_KEYS.STOK);
  let list: StokItem[] = MOCK_STOK;
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
    } catch {}
  } else {
    localStorage.setItem(STORAGE_KEYS.STOK, JSON.stringify(MOCK_STOK));
  }

  if (kodeCabangFilter && kodeCabangFilter !== 'ALL') {
    return list.filter(item => item.kodeCabang === kodeCabangFilter);
  }
  return list;
}

export function syncBranchStok(
  targetKodeCabang: string,
  targetNamaCabang: string,
  newStokItems: StokItem[],
  newProdukItems?: Produk[]
): { totalStokAdded: number; totalProdukUpdated: number } {
  const allStok = getStokList();

  const remainingStok = allStok.filter(item => item.kodeCabang !== targetKodeCabang);

  const formattedNewStok = newStokItems.map(item => ({
    ...item,
    kodeCabang: targetKodeCabang,
    namaCabang: targetNamaCabang,
  }));

  const updatedAllStok = [...remainingStok, ...formattedNewStok];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.STOK, JSON.stringify(updatedAllStok));
  }

  let produkUpdatedCount = 0;
  if (newProdukItems && newProdukItems.length > 0) {
    const currentProduk = getProdukList();
    const produkMap = new Map<string, Produk>();
    currentProduk.forEach(p => produkMap.set(p.kode, p));
    newProdukItems.forEach(p => {
      produkMap.set(p.kode, p);
      produkUpdatedCount++;
    });

    const updatedAllProduk = Array.from(produkMap.values());
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PRODUK, JSON.stringify(updatedAllProduk));
    }

    const dbProdukRows = newProdukItems.map(p => ({
      kode_produk: p.kode,
      nama_produk: p.nama,
      kategori: p.kategori,
      principle: p.namaPrinciple || p.principle,
      supplier: p.namaSupplier || p.supplier,
      hpp: p.hpp,
      hrg1: p.hrg1,
      hrg2: p.hrg2,
      hrg3: p.hrg3,
    }));
    supabase.from('produk').upsert(dbProdukRows).then();
  }

  async function syncToSupabase() {
    try {
      await supabase.from('cabang').upsert({
        kode_cabang: targetKodeCabang,
        nama_cabang: targetNamaCabang,
      });

      await supabase.from('stok_cabang').delete().eq('kode_cabang', targetKodeCabang);

      if (formattedNewStok.length > 0) {
        const dbStokRows = formattedNewStok.map(s => ({
          kode_cabang: s.kodeCabang,
          kode_produk: s.kode,
          nama_produk: s.nama,
          stok: s.stok,
          hpp: s.hpp,
          nilai: s.nilai,
          rl1: s.rl1,
          persen_h1: s.persenH1,
          rl2: s.rl2,
          persen_h2: s.persenH2,
          rl3: s.rl3,
          persen_h3: s.persenH3,
        }));
        await supabase.from('stok_cabang').insert(dbStokRows);
      }
    } catch (e) {
      console.error('Supabase Cloud Sync Error:', e);
    }
  }

  syncToSupabase();

  return {
    totalStokAdded: formattedNewStok.length,
    totalProdukUpdated: produkUpdatedCount,
  };
}
