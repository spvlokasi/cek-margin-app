import { AdminUser, Cabang, CekMarginItem, Produk, StokItem, UserSession } from './types';
import { MOCK_CABANG, MOCK_PRODUK, MOCK_STOK } from './sampleData';
import { supabase } from './supabase';

const STORAGE_KEYS = {
  PRODUK: 'cek_margin_produk_v3',
  STOK: 'cek_margin_stok_v3',
  CABANG: 'cek_margin_cabang_v3',
  SESSION: 'cek_margin_session_v3',
  ADMIN_USERS: 'cek_margin_admin_users_v3',
};

function safeSetItem(key: string, value: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error(`Storage Quota Exceeded for ${key}`, e);
    alert(`Peringatan: Kapasitas penyimpanan browser Anda hampir penuh. Sebagian data mungkin tidak tersimpan.`);
  }
}


const DEFAULT_ADMIN_USERS: AdminUser[] = [
  { id: 'adm-01', username: 'admin', nama: 'Super Admin Pusat', password: 'admin123' },
  { id: 'adm-02', username: 'spv', nama: 'SPV Bisnis', password: 'spv123' },
];

export function getAdminUserList(): AdminUser[] {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_USERS;
  const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  safeSetItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(DEFAULT_ADMIN_USERS));
  return DEFAULT_ADMIN_USERS;
}

export function addAdminUser(newAdmin: AdminUser): AdminUser[] {
  const current = getAdminUserList();
  const exists = current.find(a => a.username.toLowerCase() === newAdmin.username.toLowerCase());
  let updated: AdminUser[];
  if (exists) {
    updated = current.map(a => a.username.toLowerCase() === newAdmin.username.toLowerCase() ? { ...a, ...newAdmin } : a);
  } else {
    updated = [...current, { ...newAdmin, id: `adm-${Date.now()}` }];
  }
  if (typeof window !== 'undefined') {
    safeSetItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(updated));
  }
  return updated;
}

export function deleteAdminUser(id: string): AdminUser[] {
  const current = getAdminUserList();
  const updated = current.filter(a => a.id !== id && a.username !== 'admin');
  if (typeof window !== 'undefined') {
    safeSetItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(updated));
  }
  return updated;
}

export function getInitialSession(): UserSession {
  if (typeof window === 'undefined') {
    return { isLoggedIn: false, role: 'cabang', kodeCabang: '', namaCabang: '', username: '' };
  }
  const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.isLoggedIn === 'boolean') return parsed;
    } catch {}
  }
  return { isLoggedIn: false, role: 'cabang', kodeCabang: '', namaCabang: '', username: '' };
}

export function saveSession(session: UserSession): void {
  if (typeof window === 'undefined') return;
  safeSetItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
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

export function authenticateUser(usernameInput: string, passwordInput: string): { success: boolean; session?: UserSession; message?: string } {
  const cleanUsername = usernameInput.trim();
  const cleanPass = passwordInput.trim();

  if (!cleanUsername || !cleanPass) {
    return { success: false, message: 'Username dan Password wajib diisi.' };
  }

  // 1. Check in Admin Users List
  const adminList = getAdminUserList();
  const matchedAdmin = adminList.find(a => a.username.toLowerCase() === cleanUsername.toLowerCase());
  if (matchedAdmin) {
    if (cleanPass !== (matchedAdmin.password || 'admin123')) {
      return { success: false, message: `Password Admin [${matchedAdmin.nama}] salah!` };
    }
    const adminSession: UserSession = {
      isLoggedIn: true,
      role: 'admin',
      kodeCabang: 'ALL',
      namaCabang: 'Semua Cabang (Admin)',
      username: matchedAdmin.username,
    };
    saveSession(adminSession);
    return { success: true, session: adminSession };
  }

  // 2. Check in Cabang List
  const cabangList = getCabangList();
  const targetCabang = cabangList.find(
    (c) =>
      c.kode.toUpperCase() === cleanUsername.toUpperCase() ||
      c.nama.toLowerCase().includes(cleanUsername.toLowerCase())
  );

  if (!targetCabang) {
    return { success: false, message: `Username / Kode Cabang "${cleanUsername}" tidak ditemukan.` };
  }

  const expectedPass = targetCabang.password || '123';
  if (cleanPass !== expectedPass) {
    return { success: false, message: `Password untuk cabang [${targetCabang.nama}] salah!` };
  }

  const branchSession: UserSession = {
    isLoggedIn: true,
    role: 'cabang',
    kodeCabang: targetCabang.kode,
    namaCabang: targetCabang.nama,
    username: targetCabang.kode,
  };
  saveSession(branchSession);
  return { success: true, session: branchSession };
}

export function getCabangList(): Cabang[] {
  let list = MOCK_CABANG;
  
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEYS.CABANG);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      } catch {}
    }
  }

  // MIGRATION: Update passwords to match kode
  let hasChanges = false;
  const migratedList = list.map(c => {
    // If the password is 'M1002' but the kode is different, OR if we want to force all passwords to match kode:
    // User requested: "kalau user M1003 maka password ya M1003".
    if (c.password === 'M1002' && c.kode !== 'M1002') {
      hasChanges = true;
      return { ...c, password: c.kode };
    }
    return c;
  });

  if (hasChanges && typeof window !== 'undefined') {
    safeSetItem(STORAGE_KEYS.CABANG, JSON.stringify(migratedList));
  }

  return migratedList;
}

export function addCabang(newCabang: Cabang): Cabang[] {
  const current = getCabangList();
  const exists = current.find(c => c.kode.toUpperCase() === newCabang.kode.toUpperCase());
  let updated: Cabang[];
  if (exists) {
    updated = current.map(c => c.kode.toUpperCase() === newCabang.kode.toUpperCase() ? { ...c, ...newCabang } : c);
  } else {
    updated = [...current, { ...newCabang, password: newCabang.password || newCabang.kode }];
  }
  if (typeof window !== 'undefined') {
    safeSetItem(STORAGE_KEYS.CABANG, JSON.stringify(updated));
  }

  supabase.from('cabang').upsert({
    kode_cabang: newCabang.kode,
    nama_cabang: newCabang.nama,
    wilayah: newCabang.wilayah || 'Jawa Timur',
    password: newCabang.password || newCabang.kode,
  }).then();

  return updated;
}

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
      password: nc.password || existing?.password || nc.kode,
    });
  });

  const updated = Array.from(map.values());
  if (typeof window !== 'undefined') {
    safeSetItem(STORAGE_KEYS.CABANG, JSON.stringify(updated));
  }

  const dbRows = updated.map(c => ({
    kode_cabang: c.kode,
    nama_cabang: c.nama,
    wilayah: c.wilayah,
    password: c.password || c.kode,
  }));
  supabase.from('cabang').upsert(dbRows).then();

  return updated;
}

export function deleteCabang(kodeCabang: string): Cabang[] {
  const current = getCabangList();
  const updated = current.filter(c => c.kode.toUpperCase() !== kodeCabang.toUpperCase());
  if (typeof window !== 'undefined') {
    safeSetItem(STORAGE_KEYS.CABANG, JSON.stringify(updated));
  }
  supabase.from('cabang').delete().eq('kode_cabang', kodeCabang).then();
  return updated;
}

export function getProdukList(kodeCabangFilter?: string): Produk[] {
  if (typeof window === 'undefined') return MOCK_PRODUK;
  const saved = localStorage.getItem(STORAGE_KEYS.PRODUK);
  let list: Produk[] = MOCK_PRODUK;
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
    } catch {}
  } else {
    safeSetItem(STORAGE_KEYS.PRODUK, JSON.stringify(MOCK_PRODUK));
  }

  if (!kodeCabangFilter || kodeCabangFilter === '') return []; // Admin MUST select branch first!
  if (kodeCabangFilter === 'ALL') return list;
  return list.filter(p => !p.kodeCabang || p.kodeCabang === kodeCabangFilter);
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
    safeSetItem(STORAGE_KEYS.STOK, JSON.stringify(MOCK_STOK));
  }

  if (!kodeCabangFilter || kodeCabangFilter === '') return []; // Admin MUST select branch first!
  if (kodeCabangFilter === 'ALL') return list;
  return list.filter(item => !item.kodeCabang || item.kodeCabang === kodeCabangFilter);
}

/**
 * Generate Cek Margin Report combining Produk & Stok
 * FILTERED strictly to ONLY show items where STOK > 0!
 */
export function getCekMarginReport(kodeCabangFilter?: string): CekMarginItem[] {
  const allStok = getStokList(kodeCabangFilter);
  const allProduk = getProdukList('ALL');

  const produkMap = new Map<string, Produk>();
  allProduk.forEach(p => produkMap.set(p.kode, p));

  // Only include items with Stok > 0!
  const filteredStok = allStok.filter(s => (s.stok || 0) > 0);

  return filteredStok.map((stk, index) => {
    const prd = produkMap.get(stk.kode);
    const hpp = stk.hpp || prd?.hpp || 0;
    const hrg1 = prd?.hrg1 || hpp * 1.1;
    const hrg2 = prd?.hrg2 || hpp * 1.08;
    const hrg3 = prd?.hrg3 || hpp * 1.05;

    const mrg1 = hrg1 - hpp;
    const persen1 = hrg1 > 0 ? (mrg1 / hrg1) * 100 : 0;

    const mrg2 = hrg2 - hpp;
    const persen2 = hrg2 > 0 ? (mrg2 / hrg2) * 100 : 0;

    const mrg3 = hrg3 - hpp;
    const persen3 = hrg3 > 0 ? (mrg3 / hrg3) * 100 : 0;

    return {
      no: index + 1,
      kode: stk.kode,
      nama: stk.nama,
      namaSupplier: prd?.namaSupplier || prd?.supplier || 'Supplier Center',
      stok: stk.stok,
      hpp,
      hrg1,
      mrg1,
      persen1,
      hrg2,
      mrg2,
      persen2,
      hrg3,
      mrg3,
      persen3,
      kodeCabang: stk.kodeCabang,
      namaCabang: stk.namaCabang,
    };
  });
}

export function syncBranchStok(
  targetKodeCabang: string,
  targetNamaCabang: string,
  newStokItems?: StokItem[],
  newProdukItems?: Produk[]
): { totalStokAdded: number; totalProdukUpdated: number } {
  let stokAddedCount = 0;
  if (newStokItems !== undefined) {
    const allStok = getStokList('ALL');
    const remainingStok = allStok.filter(item => item.kodeCabang !== targetKodeCabang);

    const formattedNewStok = newStokItems.map(item => ({
      ...item,
      kodeCabang: targetKodeCabang,
      namaCabang: targetNamaCabang,
    }));

    stokAddedCount = formattedNewStok.length;
    const updatedAllStok = [...remainingStok, ...formattedNewStok];
    if (typeof window !== 'undefined') {
      safeSetItem(STORAGE_KEYS.STOK, JSON.stringify(updatedAllStok));
    }
  }

  let produkUpdatedCount = 0;
  if (newProdukItems && newProdukItems.length > 0) {
    const currentProduk = getProdukList('ALL');
    const produkMap = new Map<string, Produk>();
    currentProduk.forEach(p => produkMap.set(p.kode, p));
    newProdukItems.forEach(p => {
      produkMap.set(p.kode, { ...p, kodeCabang: targetKodeCabang });
      produkUpdatedCount++;
    });

    const updatedAllProduk = Array.from(produkMap.values());
    if (typeof window !== 'undefined') {
      safeSetItem(STORAGE_KEYS.PRODUK, JSON.stringify(updatedAllProduk));
    }
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
          rl1: 0,
          persen_h1: 0,
          rl2: 0,
          persen_h2: 0,
          rl3: 0,
          persen_h3: 0,
        }));
        await supabase.from('stok_cabang').insert(dbStokRows);
      }
    } catch (e) {
      console.error('Supabase Cloud Sync Error:', e);
    }
  }

  syncToSupabase();

  return {
    totalStokAdded: stokAddedCount,
    totalProdukUpdated: produkUpdatedCount,
  };
}
