const { createClient } = require('@supabase/supabase-js');
const url = 'https://guzepcrtmiggdeectnsr.supabase.co';

const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);
const realKey = keyMatch ? keyMatch[1].trim() : '';

const supabase = createClient(url, realKey);
(async () => {
  const { count: c1, error: e1 } = await supabase.from('produk').select('*', { count: 'exact', head: true });
  const { count: c2, error: e2 } = await supabase.from('stok_cabang').select('*', { count: 'exact', head: true });
  console.log('Produk count:', c1, e1?.message || '');
  console.log('Stok count:', c2, e2?.message || '');
})();
