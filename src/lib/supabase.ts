import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing. Check your .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
    }
});

// =====================================================
// MULTI-TENANT HELPERS
// =====================================================

/**
 * Extrai o slug da empresa do subdomínio atual
 * staging.checkship.com.br → "staging"
 * transportadorarolim.checkship.com.br → "transportadorarolim"
 * localhost → "transportadorarolim" (default para dev)
 */
export function getCompanySlug(): string {
    const hostname = window.location.hostname;

    // Desenvolvimento local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'transportadorarolim'; // Default para desenvolvimento
    }

    // Produção/Staging: pegar primeiro segmento antes de .checkship.com.br
    const parts = hostname.split('.');
    if (parts.length >= 3 && parts[parts.length - 2] === 'checkship') {
        return parts[0];
    }

    // Fallback para Vercel preview URLs (*.vercel.app)
    if (hostname.includes('vercel.app')) {
        return 'transportadorarolim';
    }

    return 'transportadorarolim';
}

/**
 * Cache do company_id para evitar múltiplas queries
 */
let cachedCompanyId: string | null = null;

/**
 * Busca o company_id baseado no slug do subdomínio
 */
export async function getCompanyId(): Promise<string | null> {
    if (cachedCompanyId) {
        return cachedCompanyId;
    }

    const slug = getCompanySlug();

    const { data, error } = await supabase
        .from('companies')
        .select('id')
        .eq('slug', slug)
        .single();

    if (error || !data) {
        console.error('Erro ao buscar company:', error);
        return null;
    }

    cachedCompanyId = data.id;
    return cachedCompanyId;
}

/**
 * Busca informações completas da empresa atual
 */
export async function getCurrentCompany() {
    const slug = getCompanySlug();

    const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Erro ao buscar company:', error);
        return null;
    }

    return data;
}

/**
 * Limpa o cache do company_id (usar ao trocar de empresa ou logout)
 */
export function clearCompanyCache() {
    cachedCompanyId = null;
}
