import { AdminUser, Cabang, CekMarginItem, Produk, StokItem, UserSession } from './types';
import { MOCK_CABANG, MOCK_PRODUK, MOCK_STOK } from './sampleData';
import { supabaseAuthAndStok, supabaseProduk } from './supabase';

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

export async function getAdminUserList(): Promise<AdminUser[]> {
  try {
    const { data, error } = await supabaseAuthAndStok.from('admin_users').select('*').order('created_at', { ascending: true });
    if (error) {
      console.error('Error fetching admin users from Supabase:', error);
      return DEFAULT_ADMIN_USERS;
    }
    if (data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.error('Exception fetching admin users from Supabase:', err);
  }
  return DEFAULT_ADMIN_USERS;
}

export async function addAdminUser(newAdmin: AdminUser): Promise<AdminUser[]> {
  await supabaseAuthAndStok.from('admin_users').upsert({
    username: newAdmin.username.toLowerCase(),
    nama: newAdmin.nama,
    password: newAdmin.password
  }, { onConflict: 'username', ignoreDuplicates: false });
  return await getAdminUserList();
}

export async function deleteAdminUser(id: string): Promise<AdminUser[]> {
  await supabaseAuthAndStok.from('admin_users').delete().eq('id', id).neq('username', 'admin');
  return await getAdminUserList();
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

export async function authenticateUser(usernameInput: string, passwordInput: string): Promise<{ success: boolean; session?: UserSession; message?: string }> {
  const cleanUsername = usernameInput.trim();
  const cleanPass = passwordInput.trim();

  if (!cleanUsername || !cleanPass) {
    return { success: false, message: 'Username dan Password wajib diisi.' };
  }

  // 1. Check in Admin Users List
  const adminList = await getAdminUserList();
  const matchedAdmin = adminList.find(a => a.username.toLowerCase() === cleanUsername.toLowerCase());
  if (matchedAdmin) {
    if (cleanPass !== (matchedAdmin.password || 'admin123')) {
      return { success: false, message: `Password Admin [${matchedAdmin.nama}] salah!` };
    }
    const adminSession: UserSession = {
      isLoggedIn: true,
      role: 'admin',
      kodeCabang: '',
      namaCabang: 'Semua Cabang (Admin)',
      username: matchedAdmin.username,
    };
    saveSession(adminSession);
    return { success: true, session: adminSession };
  }

  // 2. Check in Cabang List
  const cabangList = await getCabangList();
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

export async function getCabangList(): Promise<Cabang[]> {
  try {
    const { data, error } = await supabaseAuthAndStok.from('cabang').select('*').order('kode_cabang', { ascending: true });
    if (error) {
      console.error('Error fetching cabang from Supabase:', error);
      return MOCK_CABANG;
    }
    if (data && data.length > 0) {
      return data.map((c: any) => ({
        kode: c.kode_cabang,
        nama: c.nama_cabang,
        wilayah: c.wilayah || 'Jawa Timur',
        password: c.password || c.kode_cabang,
      }));
    }
  } catch (err) {
    console.error('Exception fetching cabang from Supabase:', err);
  }
  return MOCK_CABANG;
}

export async function addCabang(newCabang: Cabang): Promise<Cabang[]> {
  await supabaseAuthAndStok.from('cabang').upsert({
    kode_cabang: newCabang.kode,
    nama_cabang: newCabang.nama,
    wilayah: newCabang.wilayah || 'Jawa Timur',
    password: newCabang.password || newCabang.kode,
  }, { onConflict: 'kode_cabang' });

  return await getCabangList();
}

export async function bulkAddCabang(newCabangList: Cabang[]): Promise<Cabang[]> {
  const dbRows = newCabangList.map(c => ({
    kode_cabang: c.kode,
    nama_cabang: c.nama,
    wilayah: c.wilayah || 'Jawa Timur',
    password: c.password || c.kode,
  }));
  
  const chunkSize = 500;
  for (let i = 0; i < dbRows.length; i += chunkSize) {
    const chunk = dbRows.slice(i, i + chunkSize);
    await supabaseAuthAndStok.from('cabang').upsert(chunk, { onConflict: 'kode_cabang' });
  }
  
  return await getCabangList();
}

export async function deleteCabang(kode: string): Promise<Cabang[]> {
  await supabaseAuthAndStok.from('cabang').delete().eq('kode_cabang', kode);
  return await getCabangList();
}

export async function getProdukList(kodeCabangFilter?: string): Promise<Produk[]> {
  // Admin harus pilih cabang dulu - data produk per cabang
  if (!kodeCabangFilter || kodeCabangFilter === 'ALL') return [];
  try {
    const query = supabaseProduk.from('produk').select('*').eq('kode_cabang', kodeCabangFilter).limit(20000).order('nama_produk', { ascending: true });
    
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching produk from Supabase schema', kodeCabangFilter, ':', error);
      return [];
    }
    
    if (data) {
      return data.map((p: any, index: number) => ({
        no: index + 1,
        kode: p.kode_produk,
        nama: p.nama_produk,
        kategori: p.kategori || '',
        principle: p.principle || '',
        namaPrinciple: p.nama_principle || '',
        supplier: p.supplier || '',
        namaSupplier: p.nama_supplier || '',
        hpp: p.hpp || 0,
        hrg1: p.hrg1 || 0,
        hrg2: p.hrg2 || 0,
        hrg3: p.hrg3 || 0,
      }));
    }
  } catch (err) {
    console.error('Exception fetching produk from Supabase:', err);
  }
  return [];
}

export async function getStokList(kodeCabangFilter?: string): Promise<StokItem[]> {
  if (!kodeCabangFilter || kodeCabangFilter === 'ALL') return []; // Admin MUST select branch first!
  try {
    const query = supabaseAuthAndStok.from('stok').select('*').eq('kode_cabang', kodeCabangFilter).limit(20000);
    
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching stok_cabang from schema', kodeCabangFilter, ':', error);
      return [];
    }
    
    if (data) {
      return data.map((s: any, index: number) => ({
        no: index + 1,
        kodeCabang: s.kode_cabang,
        kode: s.kode_produk,
        nama: s.nama_produk,
        stok: s.stok || 0,
        hpp: s.hpp || 0,
        nilai: s.nilai || 0,
      }));
    }
  } catch (err) {
    console.error('Exception fetching stok_cabang:', err);
  }
  return [];
}

/**
 * Generate Cek Margin Report combining Produk & Stok
 * FILTERED strictly to ONLY show items where STOK > 0!
 */
export async function getCekMarginReport(kodeCabangFilter?: string): Promise<CekMarginItem[]> {
  if (!kodeCabangFilter || kodeCabangFilter === '') return [];

  const [stokList, produkList] = await Promise.all([
    getStokList(kodeCabangFilter),
    getProdukList(kodeCabangFilter)
  ]);

  const produkMap = new Map<string, Produk>();
  produkList.forEach(p => produkMap.set(p.kode, p));

  // Only include items with Stok > 0!
  const filteredStok = stokList.filter(s => (s.stok || 0) > 0);

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

export async function syncBranchStok(
  targetKodeCabang: string,
  targetNamaCabang: string,
  newStokItems?: StokItem[],
  newProdukItems?: Produk[]
): Promise<{ totalStokAdded: number; totalProdukUpdated: number }> {
  let stokAddedCount = 0;
  let produkUpdatedCount = 0;

  try {
    await supabaseAuthAndStok.from('cabang').upsert({
      kode_cabang: targetKodeCabang,
      nama_cabang: targetNamaCabang,
    });

    if (newStokItems && newStokItems.length > 0) {
      await supabaseAuthAndStok.from('stok').delete().eq('kode_cabang', targetKodeCabang);

      const dbStokRows = newStokItems.map(s => ({
        kode_cabang: targetKodeCabang,
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

      const chunkSize = 1500;
      for (let i = 0; i < dbStokRows.length; i += chunkSize) {
        const chunk = dbStokRows.slice(i, i + chunkSize);
        
        let attempts = 0;
        while (attempts < 3) {
          try {
            const { error } = await supabaseAuthAndStok.from('stok').upsert(chunk, { onConflict: 'kode_cabang,kode_produk' });
            if (error) throw new Error(error.message);
            break; // Success, break retry loop
          } catch (err: any) {
            attempts++;
            if (attempts >= 3) {
              throw new Error(`Gagal menyimpan stok: ${err.message || err}`);
            }
            // Wait 1.5 seconds before retrying
            await new Promise(res => setTimeout(res, 1500));
          }
        }
        // Small delay between successful chunks to avoid overwhelming the network
        await new Promise(res => setTimeout(res, 300));
      }
      stokAddedCount = dbStokRows.length;
    }

    if (newProdukItems && newProdukItems.length > 0) {
      await supabaseProduk.from('produk').delete().eq('kode_cabang', targetKodeCabang);

      const dbProdukRows = newProdukItems.map(p => ({
        kode_produk: p.kode,
        kode_cabang: targetKodeCabang,
        nama_produk: p.nama,
        kategori: p.kategori,
        principle: p.principle,
        nama_principle: p.namaPrinciple,
        supplier: p.supplier,
        nama_supplier: p.namaSupplier,
        hpp: p.hpp,
        hrg1: p.hrg1,
        hrg2: p.hrg2,
        hrg3: p.hrg3,
      }));

      const chunkSize = 1500;
      for (let i = 0; i < dbProdukRows.length; i += chunkSize) {
        const chunk = dbProdukRows.slice(i, i + chunkSize);
        
        let attempts = 0;
        while (attempts < 3) {
          try {
            const { error } = await supabaseProduk.from('produk').upsert(chunk, { onConflict: 'kode_cabang,kode_produk' });
            if (error) throw new Error(error.message);
            break; // Success, break retry loop
          } catch (err: any) {
            attempts++;
            if (attempts >= 3) {
              throw new Error(`Gagal menyimpan produk: ${err.message || err}`);
            }
            // Wait 1.5 seconds before retrying
            await new Promise(res => setTimeout(res, 1500));
          }
        }
        // Small delay between successful chunks
        await new Promise(res => setTimeout(res, 300));
      }
      produkUpdatedCount = dbProdukRows.length;
    }
  } catch (e) {
    console.error('Supabase Cloud Sync Error:', e);
    throw e;
  }

  return {
    totalStokAdded: stokAddedCount,
    totalProdukUpdated: produkUpdatedCount,
  };
}
