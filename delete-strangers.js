import https from 'https';

// --- CONFIGURAÇÃO ---
const SUPABASE_URL = 'https://thztbankqpgtgiknzkaw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoenRiYW5rcXBndGdpa256a2F3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkxNzY5OSwiZXhwIjoyMDgzNDkzNjk5fQ.XfJy9FlkUm1FV5EKs73Lfc8peOlLB5go3h0-SFYbdRs';

// --- USUÁRIOS PARA DELETAR ---
const USERS_TO_DELETE = [
    'carlos.silva2@rolim.com.br',
    'daniel.meneses@rolim.com.br',
    'elenete.pinto@rolim.com.br',
    'eliseth.souza@rolim.com.br',
    'gricelmo.sobreira@rolim.com.br',
    'laurentine.ferreira@rolim.com.br',
    'leoney.melo@rolim.com.br',
    'lucas.silva@rolim.com.br',
    'onesio.moraes@rolim.com.br',
    'osvaldo.neto@rolim.com.br',
    'quelia.silva@rolim.com.br',
    'jorge.tavares@rolim.com.br',
    'monalisa.serra@rolim.com.br',
    'alenilson.filho@rolim.com.br',
    'alessandra.silva@rolim.com.br',
    'oliveira.antonio@rolim.com.br',
    'arnaldo.lima@rolim.com.br',
    'carlos.silva@rolim.com.br',
    'dalmo.bezerra@rolim.com.br',
    'derisvalto.silva@rolim.com.br',
    'edson.oliveira@rolim.com.br',
    'francisco.rodrigues@rolim.com.br',
    'francisco.silva@rolim.com.br',
    'gencilson.sousa@rolim.com.br',
    'gregorio.costa@rolim.com.br',
    'gustavo.santos@rolim.com.br',
    'ilton.silva@rolim.com.br',
    'joao.soares@rolim.com.br',
    'joneide.alves@rolim.com.br',
    'jose.costa@rolim.com.br',
    'jose.sousa@rolim.com.br',
    'luis.silva@rolim.com.br',
    'manoel.silva@rolim.com.br',
    'marilano.silva@rolim.com.br',
    'manoel.souza@rolim.com.br',
    'maria.silva@rolim.com.br',
    'mauricio.carvalho@rolim.com.br',
    'richard.figueira@rolim.com.br',
    'rita.silva@rolim.com.br',
    'rogerio.lopes@rolim.com.br',
    'ronilson.silva@rolim.com.br',
    'wanderlei.silva@rolim.com.br',
    'zenilson.souza@rolim.com.br'
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

async function fetchUserIdByEmail(email) {
    const res = await request(`/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=id`, 'GET');
    if (res.data && res.data.length > 0) {
        return res.data[0].id;
    }
    return null;
}

async function deleteAuthUser(uid) {
    return request(`/auth/v1/admin/users/${uid}`, 'DELETE');
}

async function deleteProfileByEmail(email) {
    return request(`/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`, 'DELETE');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --- FUNÇÃO PRINCIPAL ---

async function main() {
    console.log('=== LIMPEZA DE USUÁRIOS ESTRANHOS ===\n');
    console.log(`Total a deletar: ${USERS_TO_DELETE.length}\n`);

    let deletedCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;

    for (const email of USERS_TO_DELETE) {
        try {
            const uid = await fetchUserIdByEmail(email);

            if (uid) {
                await deleteAuthUser(uid);
                await deleteProfileByEmail(email);
                console.log(`✓ Deletado: ${email}`);
                deletedCount++;
            } else {
                console.log(`⊘ Não encontrado: ${email}`);
                notFoundCount++;
            }

            await sleep(200);
        } catch (error) {
            console.error(`✗ Erro ao deletar ${email}:`, error.message);
            errorCount++;
        }
    }

    console.log('\n=== RESULTADO ===');
    console.log(`Deletados com sucesso: ${deletedCount}/${USERS_TO_DELETE.length}`);
    console.log(`Não encontrados: ${notFoundCount}`);
    console.log(`Erros: ${errorCount}`);
    console.log('\n✓ Limpeza concluída!');
}

main().catch(console.error);
