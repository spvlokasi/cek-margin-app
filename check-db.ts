import { createClient } from '@supabase/supabase-js';

const url = 'https://guzepcrtmiggdeectnsr.supabase.co';
const key = 'REPLACEME'; // I'll get this from .env directly using grep

const supabase = createClient(url, key);
(async () => {
  const { count: c1 } = await supabase.from('produk').select('*', { count: 'exact', head: true });
  const { count: c2 } = await supabase.from('stok_cabang').select('*', { count: 'exact', head: true });
  console.log('Produk:', c1);
  console.log('Stok:', c2);
})();
