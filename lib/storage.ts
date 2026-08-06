import { Cabang, Produk, StokItem, UserSession } from './types';
import { MOCK_CABANG, MOCK_PRODUK, MOCK_STOK } from './sampleData';

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
 * Wipe and replace stock data specifically for a target branch!
 * This guarantees zero conflicts between branches.
 */
export function syncBranchStok(
  targetKodeCabang: string,
  targetNamaCabang: string,
  newStokItems: StokItem[],
  newProdukItems?: Produk[]
): { totalStokAdded: number; totalProdukUpdated: number } {
  const allStok = getStokList();

  // 1. Wipe old stock for this specific branch ONLY
  const remainingStok = allStok.filter(item => item.kodeCabang !== targetKodeCabang);

  // 2. Attach updated metadata
  const formattedNewStok = newStokItems.map(item => ({
    ...item,
    kodeCabang: targetKodeCabang,
    namaCabang: targetNamaCabang,
  }));

  const updatedAllStok = [...remainingStok, ...formattedNewStok];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.STOK, JSON.stringify(updatedAllStok));
  }

  // 3. Update master produk if provided
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
  }

  return {
    totalStokAdded: formattedNewStok.length,
    totalProdukUpdated: produkUpdatedCount,
  };
}
