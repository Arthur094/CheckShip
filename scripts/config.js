/**
 * Configuração centralizada do Supabase para scripts de automação
 * As credenciais são lidas do arquivo .env na pasta scripts/
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Carregar .env da pasta scripts
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env') });

// Validar variáveis de ambiente
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Erro: Arquivo .env não encontrado ou incompleto!');
    console.error('   Copie scripts/.env.example para scripts/.env e preencha suas credenciais.');
    process.exit(1);
}

export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
