import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente do Supabase, se o .env.local tiver as duas variáveis. Sem elas, o site roda só
 * no navegador (sem login), como antes.
 */
export function createSupabaseClient(env: {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}): SupabaseClient | null {
  const url = env.VITE_SUPABASE_URL?.trim();
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key);
}
