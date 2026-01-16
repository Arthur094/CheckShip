import fs from 'fs';
import csv from 'csv-parser';
import https from 'https';

// ⚠️ CONFIGURE AQUI - Obtenha no Supabase Dashboard → Settings → API
const SUPABASE_URL = 'https://thztbankqpgtgiknzkaw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoenRiYW5rcXBndGdpa256a2F3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkxNzY5OSwiZXhwIjoyMDgzNDkzNjk5fQ.XfJy9FlkUm1FV5EKs73Lfc8peOlLB5go3h0-SFYbdRs';

// Lista para armazenar usuários do CSV
const users = [];

// Ler CSV
fs.createReadStream('usuarios.csv')
    .pipe(csv())
    .on('data', (row) => {
        users.push(row);
    })
    .on('end', async () => {
        console.log(`Usuarios encontrados no CSV: ${users.length}`);
        console.log('Iniciando importacao...\n');

        let success = 0;
        let errors = 0;

        for (const user of users) {
            try {
                await createUser(user);
                success++;
                console.log(`OK ${user.email} criado com sucesso (${success}/${users.length})`);
            } catch (error) {
                errors++;
                console.error(`ERRO ${user.email} falhou:`, error.message);
            }

            // Delay para não sobrecarregar a API
            await sleep(500);
        }

        console.log('\nImportacao concluida!');
        console.log(`   Sucesso: ${success}`);
        console.log(`   Erros: ${errors}`);
    });

// Função para criar usuário via Supabase Admin API
async function createUser(user) {
    const { email, password, full_name, role, document, phone } = user;

    const payload = {
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name,
            role: role || 'MOTORISTA'
        }
    };

    const options = {
        hostname: SUPABASE_URL.replace('https://', ''),
        path: '/auth/v1/admin/users',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', async () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    const authUser = JSON.parse(data);

                    // Criar perfil manualmente (caso trigger não funcione)
                    await createProfile(authUser.id, email, full_name, role, document, phone);
                    resolve(authUser);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.write(JSON.stringify(payload));
        req.end();
    });
}

// Função para criar perfil
async function createProfile(userId, email, full_name, role, document, phone) {
    const payload = {
        id: userId,
        email,
        full_name,
        role: role || 'MOTORISTA',
        document: document || null,
        phone: phone || null,
        active: true
    };

    const options = {
        hostname: SUPABASE_URL.replace('https://', ''),
        path: '/rest/v1/profiles',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Prefer': 'return=minimal'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve();
            } else {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    console.warn(`  Perfil nao criado automaticamente para ${email}`);
                    resolve(); // Não falha se perfil já existir
                });
            }
        });

        req.on('error', reject);
        req.write(JSON.stringify(payload));
        req.end();
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
