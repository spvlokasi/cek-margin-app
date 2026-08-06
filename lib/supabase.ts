import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://guzepcrtmiggdeectnsr.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_yFHZ685b2HJp5-1R0V-1CA_rOO2LmyI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
