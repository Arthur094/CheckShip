import https from 'https';

// --- CONFIGURAÇÃO ---
const SUPABASE_URL = 'https://thztbankqpgtgiknzkaw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoenRiYW5rcXBndGdpa256a2F3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkxNzY5OSwiZXhwIjoyMDgzNDkzNjk5fQ.XfJy9FlkUm1FV5EKs73Lfc8peOlLB5go3h0-SFYbdRs';

// --- USUÁRIOS CORRIGIDOS (sem acentos) ---
const USUARIOS_CORRIGIDOS = [
    { full_name: 'ROGÉRIO FELICIO LOPES DOS SANTOS', email: 'rogerio.santos@rolim.com.br', password: 'Rogerio@2026', role: 'MOTORISTA', document: '759.033.933-49' },
    { full_name: 'GRIGÓRIO SOBRINHO', email: 'grigorio.sobrinho@rolim.com.br', password: 'Grigorio@2026', role: 'GESTOR', document: '117.307.061-34' },
    { full_name: 'JOSÉ FERNANDO ROLIM', email: 'jose.rolim@rolim.com.br', password: 'Jose@2026', role: 'GESTOR', document: '016.703.813-31' },
    { full_name: 'JOÃO GERSON GOMES SOARES', email: 'joao.soares@rolim.com.br', password: 'Joao@2026', role: 'MOTORISTA', document: '557.055.373-87' },
    { full_name: 'JOSÉ AGNALDO DA SILVA GADEIA', email: 'jose.gadeia@rolim.com.br', password: 'Jose@2026', role: 'MOTORISTA', document: '846.938.003-68' },
    { full_name: 'JOSÉ MARCOS CAITANO PEREIRA', email: 'jose.pereira@rolim.com.br', password: 'Jose@2026', role: 'MOTORISTA', document: '861.736.933-72' }
];

// --- FUNÇÕES AUXILIARES ---

function request(path, method, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SUPABASE_URL.replace('https://', ''),
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Prefer': 'return=representation'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = data ? JSON.parse(data) : null;
                    resolve({ statusCode: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function createAuthUser(user) {
    const payload = {
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
            full_name: user.full_name,
            role: user.role
        }
    };

    const res = await request('/auth/v1/admin/users', 'POST', payload);

    if (res.statusCode >= 200 && res.statusCode < 300 && res.data && res.data.id) {
        await createProfile(res.data.id, user);
        return { success: true };
    } else {
        return { success: false, error: res.data };
    }
}

async function createProfile(id, user) {
    const payload = {
        id: id,
        email: user.email,
        full_name: user.full_name,
        role: user.role || 'MOTORISTA',
        document: user.document || null,
        phone: null,
        active: true
    };

    return request('/rest/v1/profiles', 'POST', payload);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --- FUNÇÃO PRINCIPAL ---

async function main() {
    console.log('=== CORREÇÃO DE USUÁRIOS COM ACENTOS ===\n');
    console.log(`Total a corrigir: ${USUARIOS_CORRIGIDOS.length}\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of USUARIOS_CORRIGIDOS) {
        try {
            console.log(`Criando: ${user.email}...`);
            const result = await createAuthUser(user);

            if (result.success) {
                console.log(`  ✓ Sucesso!`);
                successCount++;
            } else {
                console.log(`  ✗ Erro:`, result.error);
                errorCount++;
            }

            await sleep(300);
        } catch (error) {
            console.error(`  ✗ Erro ao criar ${user.email}:`, error.message);
            errorCount++;
        }
    }

    console.log('\n=== RESULTADO ===');
    console.log(`Criados com sucesso: ${successCount}/${USUARIOS_CORRIGIDOS.length}`);
    console.log(`Erros: ${errorCount}`);
    console.log('\n✓ Correção concluída!');
}

main().catch(console.error);
