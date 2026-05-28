import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://jrtqaqslvogkezfmxzqp.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_J4xQ6bx-nzH86pWVs8AWSg_L8Qfjp93';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

