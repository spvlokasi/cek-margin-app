import { createClient } from '@supabase/supabase-js';

// Hardcode langsung untuk menghindari Vercel membaca Environment Variable lama yang sudah dihapus
const SUPABASE_URL_A = 'https://idzssovwyfpckyqbqdii.supabase.co';
const SUPABASE_ANON_KEY_A = 'sb_publishable_tlYT1THerfh78vLUet24Cw_tCCglBte';

const SUPABASE_URL_B = 'https://xxnnqmcuswjxievjicxs.supabase.co';
const SUPABASE_ANON_KEY_B = 'sb_publishable_PHA2tcWB1q0i7QpK1T8ssA_KCAkh_4B';

// Gudang A (Auth & Stok)
export const supabase = createClient(SUPABASE_URL_A, SUPABASE_ANON_KEY_A);
// Alias untuk konsistensi
export const supabaseAuthAndStok = supabase;

// Gudang B (Produk)
export const supabaseProduk = createClient(SUPABASE_URL_B, SUPABASE_ANON_KEY_B);
