import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://idzssovwyfpckyqbqdii.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_tlYT1THerfh78vLUet24Cw_tCCglBte';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
