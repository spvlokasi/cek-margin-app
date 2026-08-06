import { Cabang, Produk, StokItem, UserSession } from './types';
import { MOCK_CABANG, MOCK_PRODUK, MOCK_STOK } from './sampleData';
import { supabase } from './supabase';

const STORAGE_KEYS = {
  PRODUK: 'cek_margin_produk_v1',
  STOK: 'cek_margin_stok_v1',
  CABANG: 'cek_margin_cabang_v1',
  SESSION: 'cek_margin_session_v1',
};

export function getInitialSession(): UserSession {
  if (typeof window === 'undefined') {
    return { role: 'admin', kodeCabang: 'ALL', namaCabang: 'Semua Cabang (Admin)' };
  }
  const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  return { role: 'admin', kodeCabang: 'ALL', namaCabang: 'Semua Cabang (Admin)' };
}

export function saveSession(session: UserSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
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
  const exists = current.find(c => c.kode === newCabang.kode);
  let updated: Cabang[];
  if (exists) {
    updated = current.map(c => c.kode === newCabang.kode ? newCabang : c);
  } else {
    updated = [...current, newCabang];
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CABANG, JSON.stringify(updated));
  }

  // Async sync to Supabase cabang table
  supabase.from('cabang').upsert({
    kode_cabang: newCabang.kode,
    nama_cabang: newCabang.nama,
    wilayah: newCabang.wilayah || 'Jawa Timur'
  }).then();

  return updated;
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

/**
 * Wipe & Replace stock data for target branch locally AND directly on Supabase Cloud!
 */
export function syncBranchStok(
  targetKodeCabang: string,
  targetNamaCabang: string,
  newStokItems: StokItem[],
  newProdukItems?: Produk[]
): { totalStokAdded: number; totalProdukUpdated: number } {
  const allStok = getStokList();

  // 1. Wipe old stock for this specific branch ONLY locally
  const remainingStok = allStok.filter(item => item.kodeCabang !== targetKodeCabang);

  // 2. Format new items
  const formattedNewStok = newStokItems.map(item => ({
    ...item,
    kodeCabang: targetKodeCabang,
    namaCabang: targetNamaCabang,
  }));

  const updatedAllStok = [...remainingStok, ...formattedNewStok];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.STOK, JSON.stringify(updatedAllStok));
  }

  // 3. Update master produk locally
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

    // Async sync produk to Supabase
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

  // 4. SYNC TO SUPABASE CLOUD: Delete old branch stock & insert new branch stock
  async function syncToSupabase() {
    try {
      // First ensure branch exists in cabang table
      await supabase.from('cabang').upsert({
        kode_cabang: targetKodeCabang,
        nama_cabang: targetNamaCabang,
      });

      // Delete old rows for this branch
      await supabase.from('stok_cabang').delete().eq('kode_cabang', targetKodeCabang);

      // Insert new rows
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
