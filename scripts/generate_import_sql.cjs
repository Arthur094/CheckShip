
const fs = require('fs');
const path = require('path');

const DUMP_DIR = path.join(__dirname, '../dump_producao');
const OUTPUT_FILE = path.join(__dirname, '../database/SCRIPT_IMPORT_PROD_DUMP.sql');

// Mapeamento de Ordem de Importação (para respeitar FKs)
const TABLES_ORDER = [
    'companies',
    'access_profiles',
    'checklist_templates', // Templates podem ser referenciados
    'vehicle_types',
    'vehicles',
    'profiles', // Profiles podem depender de access_profiles e company.
    // CUIDADO: Profiles e Vehicles podem ter dependência circular se houver owner? Não, vehicles tem company_id.
    // INSPECTIONS depende de vehicles, profiles, templates
    'checklist_inspections',
    // JOINS
    'vehicle_assignments',
    'vehicle_checklist_assignments',
    'profile_checklist_permissions'
    // Outras se houver
];

// Nomes de arquivo podem ter sufixo _rows.csv
function findCsvFile(tableName) {
    const candidate = path.join(DUMP_DIR, `${tableName}_rows.csv`);
    if (fs.existsSync(candidate)) return candidate;
    return null;
}

function escapeSqlString(str) {
    if (str === null || str === undefined || str === '') return 'NULL';
    // Se for string "null" (texto), vira string. Se for vazio CSV, vira NULL.
    // Mas CSV parser simples pode ser tricky.
    // Vamos assumir que split por virgula funciona para casos simples, mas CSV com virgula e aspas é complexo.
    // Vou usar regex para splitar CSV corretamente.
    return `'${str.replace(/'/g, "''")}'`;
}

// Simple CSV parser that handles quoted strings
function parseCsvLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current);
    return values;
}

const SCHEMA_ADJUSTMENTS = `
-- =================================================================
-- 1. AJUSTES DE SCHEMA (Para garantir compatibilidade com Prod)
-- =================================================================

-- checklist_inspections
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS responses JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS data_json JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS odometer_reading TEXT;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS analysis_status TEXT;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS analysis_current_step INTEGER;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS analysis_total_steps INTEGER;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS analysis_first_result TEXT;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS analysis_first_by UUID;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS analysis_first_at TIMESTAMPTZ;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS analysis_first_reason TEXT;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS analysis_second_result TEXT;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS analysis_second_by UUID;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS analysis_second_at TIMESTAMPTZ;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS analysis_second_reason TEXT;

-- profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT false;

-- =================================================================
-- 2. LIMPEZA DE DADOS (TRUNCATE)
-- =================================================================
-- Desativar triggers temporariamente se possível, ou usar CASCADE
TRUNCATE TABLE 
    public.checklist_records,
    public.inspection_photos,
    public.checklist_inspections,
    public.vehicle_checklist_assignments,
    public.vehicle_assignments,
    public.profile_checklist_permissions,
    public.vehicles,
    public.vehicle_types,
    public.checklist_templates,
    public.profiles,
    public.access_profiles,
    public.companies
CASCADE;

-- =================================================================
-- 3. IMPORTAÇÃO DE DADOS
-- =================================================================
`;

let sqlOutput = SCHEMA_ADJUSTMENTS;

TABLES_ORDER.forEach(table => {
    const csvPath = findCsvFile(table);
    if (!csvPath) {
        console.log(`Skipping ${table} (file not found)`);
        return;
    }

    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return; // Header only

    const header = parseCsvLine(lines[0]);

    // Mapear indices das colunas
    // Vamos gerar INSERT INTO table (col1, col2) VALUES ...
    const columnsStr = header.map(h => `"${h}"`).join(', ');

    console.log(`Processing ${table}: ${lines.length - 1} rows`);

    lines.slice(1).forEach(line => {
        const values = parseCsvLine(line);
        if (values.length !== header.length) {
            console.warn(`Row length mismatch in ${table}. Expected ${header.length}, got ${values.length}`);
            return;
        }

        const valuesSql = values.map(v => {
            if (v === '' || v === 'null' || v === 'NULL') return 'NULL';
            // Tratar JSON
            if (v.startsWith('{') || v.startsWith('[')) {
                // CSV escapes quotes as "", we need to unescape slightly for SQL?
                // Na verdade, parseCsvLine já tratou o quote duplo do CSV.
                // Mas para SQL string, precisamos escapar single quotes.
                return `'${v.replace(/'/g, "''")}'`;
            }
            if (v === 'true') return 'true';
            if (v === 'false') return 'false';

            // Tentar identificar se é string ou numero?
            // PostgreSQL aceita '123' para integer, então tudo como string segura é ok, exceto NULL.
            return `'${v.replace(/'/g, "''")}'`;
        }).join(', ');

        sqlOutput += `INSERT INTO public.${table} (${columnsStr}) VALUES (${valuesSql});\n`;
    });
    sqlOutput += '\n';
});

fs.writeFileSync(OUTPUT_FILE, sqlOutput);
console.log(`Generated ${OUTPUT_FILE}`);
