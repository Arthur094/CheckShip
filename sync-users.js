import https from 'https';

// --- CONFIGURAÇÃO ---
const SUPABASE_URL = 'https://thztbankqpgtgiknzkaw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoenRiYW5rcXBndGdpa256a2F3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkxNzY5OSwiZXhwIjoyMDgzNDkzNjk5fQ.XfJy9FlkUm1FV5EKs73Lfc8peOlLB5go3h0-SFYbdRs';

// --- USUÁRIOS PARA DELETAR ---
const USERS_TO_DELETE = [
    'paulo.barros@rolim.com.br',
    'camila.rolim@rolim.com.br',
    'elisete.pinto@rolim.com.br',
    'elieth.souza@rolim.com.br',
    'jéssica.silva@rolim.com.br',
    'josiane.ferreira@rolim.com.br',
    'milena.oliveira@rolim.com.br',
    'norma.vieira@rolim.com.br',
    'odecio.morais@rolim.com.br',
    'queila.silva@rolim.com.br',
    'carlos.ferreira@rolim.com.br',
    'fabio.machado@rolim.com.br',
    'francisco.vieira@rolim.com.br',
    'jorge.rabelo@rolim.com.br',
    'levi.lima@rolim.com.br',
    'lino.serra@rolim.com.br'
];

// --- USUÁRIOS PARA SINCRONIZAR ---
const USERS_TO_SYNC = [
    { full_name: 'ABMAEL GOMES DA SILVA', email: 'abmael.silva@rolim.com.br', password: 'Abmael@2026', role: 'MOTORISTA', document: '961.605.513-53' },
    { full_name: 'ADEILSON SILVA SANTOS', email: 'adeilson.santos@rolim.com.br', password: 'Adeilson@2026', role: 'MOTORISTA', document: '973.168.063-20' },
    { full_name: 'ALDENOR FERREIRA DOS ANJOS', email: 'aldenor.anjos@rolim.com.br', password: 'Aldenor@2026', role: 'MOTORISTA', document: '508.445.393-68' },
    { full_name: 'ANTONIO BARBOSA DUTRA', email: 'antonio.dutra@rolim.com.br', password: 'Antonio@2026', role: 'MOTORISTA', document: '019.929.223-06' },
    { full_name: 'ANTONIO ERILEUDO DA SILVA BEZERRA', email: 'antonio.bezerra@rolim.com.br', password: 'Antonio@2026', role: 'MOTORISTA', document: '029.513.103-90' },
    { full_name: 'ANTONIO LEISOM OLIVEIRA DA SILVA', email: 'antonio.silva@rolim.com.br', password: 'Antonio@2026', role: 'MOTORISTA', document: '602.548.323-00' },
    { full_name: 'ANTONIO VIEIRA DOS SANTOS FILHO', email: 'antonio.filho@rolim.com.br', password: 'Antonio@2026', role: 'MOTORISTA', document: '687.855.933-20' },
    { full_name: 'ARNAILDES SILVA LIMA', email: 'arnaildes.lima@rolim.com.br', password: 'Arnaildes@2026', role: 'MOTORISTA', document: '922.338.993-34' },
    { full_name: 'COSMIDAN CARDOSO PEREIRA', email: 'cosmidan.pereira@rolim.com.br', password: 'Cosmidan@2026', role: 'MOTORISTA', document: '001.725.223-74' },
    { full_name: 'DERISVALDO PINHEIRO DA SILVA', email: 'derisvaldo.silva@rolim.com.br', password: 'Derisvaldo@2026', role: 'MOTORISTA', document: '946.955.393-49' },
    { full_name: 'EDSON DE OLIVEIRA COSTA', email: 'edson.costa@rolim.com.br', password: 'Edson@2026', role: 'MOTORISTA', document: '930.420.274-49' },
    { full_name: 'FRANCISCO DAS CHAGAS CARNEIRO LOBO', email: 'francisco.lobo@rolim.com.br', password: 'Francisco@2026', role: 'MOTORISTA', document: '269.438.673-34' },
    { full_name: 'FRANCISCO RODRIGUES TEIXEIRA PESSOA', email: 'francisco.pessoa@rolim.com.br', password: 'Francisco@2026', role: 'MOTORISTA', document: '617.074.903-25' },
    { full_name: 'FRANCISCO TELONE NEVES PEREIRA', email: 'francisco.pereira@rolim.com.br', password: 'Francisco@2026', role: 'MOTORISTA', document: '771.612.033-68' },
    { full_name: 'GENEGILSON BARROS SOUSA', email: 'genegilson.sousa@rolim.com.br', password: 'Genegilson@2026', role: 'MOTORISTA', document: '467.791.323-49' },
    { full_name: 'GENILSON ROCHA DA SILVA', email: 'genilson.silva@rolim.com.br', password: 'Genilson@2026', role: 'MOTORISTA', document: '954.040.233-68' },
    { full_name: 'GEORGE SANTANA DE SOUSA', email: 'george.sousa@rolim.com.br', password: 'George@2026', role: 'MOTORISTA', document: '269.911.953-91' },
    { full_name: 'GRIGORIO HELINO CUTRIM COSTA', email: 'grigorio.costa@rolim.com.br', password: 'Grigorio@2026', role: 'MOTORISTA', document: '023.076.958-69' },
    { full_name: 'GRUNEWALDO RODMAQ GOMES P. DE OLIVEIRA', email: 'grunewaldo.oliveira@rolim.com.br', password: 'Grunewaldo@2026', role: 'MOTORISTA', document: '264.211.942-49' },
    { full_name: 'GUSTAVO CARNEIRO CARDOSO', email: 'gustavo.cardoso@rolim.com.br', password: 'Gustavo@2026', role: 'MOTORISTA', document: '010.255.863-95' },
    { full_name: 'IAN LENON BATISTA SANTANA', email: 'ian.santana@rolim.com.br', password: 'Ian@2026', role: 'MOTORISTA', document: '049.227.283-25' },
    { full_name: 'JONEIDE DACIO DE BRITO AZEVEDO', email: 'joneide.azevedo@rolim.com.br', password: 'Joneide@2026', role: 'MOTORISTA', document: '019.406.734-37' },
    { full_name: 'JOSÉ MARCOS CAITANO PEREIRA', email: 'josé.pereira@rolim.com.br', password: 'José@2026', role: 'MOTORISTA', document: '861.736.933-72' },
    { full_name: 'JOSÉ WILSON DA SILVA', email: 'jose.silva@rolim.com.br', password: 'Jose@2026', role: 'MOTORISTA', document: '139.039.183-34' },
    { full_name: 'JUAREZ ALMEIDA DA SILVA', email: 'juarez.silva@rolim.com.br', password: 'Juarez@2026', role: 'MOTORISTA', document: '003.657.868-10' },
    { full_name: 'LUIS CARLOS CARVALHO TEIXEIRA', email: 'luis.teixeira@rolim.com.br', password: 'Luis@2026', role: 'MOTORISTA', document: '805.587.473-53' },
    { full_name: 'LUIS CARLOS TEIXEIRA', email: 'luis.carlos@rolim.com', password: 'Luis@2026', role: 'MOTORISTA', document: '288.787.873-53' },
    { full_name: 'MAKLAWD PESTANA DA SILVA', email: 'maklawd.silva@rolim.com.br', password: 'Maklawd@2026', role: 'MOTORISTA', document: '635.631.693-49' },
    { full_name: 'MANOEL JULIO DE SOUZA NETO', email: 'manoel.neto@rolim.com.br', password: 'Manoel@2026', role: 'MOTORISTA', document: '807.124.953-04' },
    { full_name: 'MARCOS FERREIRA MIRANDA', email: 'marcos.miranda@rolim.com.br', password: 'Marcos@2026', role: 'MOTORISTA', document: '951.744.433-87' },
    { full_name: 'MARIO TEIXEIRA NUNES FILHO', email: 'mario.filho@rolim.com.br', password: 'Mario@2026', role: 'MOTORISTA', document: '282.899.943-20' },
    { full_name: 'MICERNANDES OLIVEIRA FERNANDES', email: 'micernandes.fernandes@rolim.com.br', password: 'Micernandes@2026', role: 'MOTORISTA', document: '690.278.623-20' },
    { full_name: 'RAIMUNDO DUARTE NETO', email: 'raimundo.neto@rolim.com.br', password: 'Raimundo@2026', role: 'MOTORISTA', document: '209.989.963-00' },
    { full_name: 'REGINALDO BATISTA DOS SANTOS', email: 'reginaldo.santos@rolim.com.br', password: 'Reginaldo@2026', role: 'MOTORISTA', document: '466.679.893-53' },
    { full_name: 'RICHARD MAKLEY FIGUEIRA TORRES', email: 'richard.torres@rolim.com.br', password: 'Richard@2026', role: 'MOTORISTA', document: '976.102.403-20' },
    { full_name: 'ROBERTO ARAÚJO DOS SANTOS', email: 'roberto.santos@rolim.com.br', password: 'Roberto@2026', role: 'MOTORISTA', document: '976.027.873-17' },
    { full_name: 'ROBERTO CARLOS ALVES DA SILVA', email: 'roberto.silva@rolim.com.br', password: 'Roberto@2026', role: 'MOTORISTA', document: '330.986.113-91' },
    { full_name: 'ROGÉRIO FELICIO LOPES DOS SANTOS', email: 'rogério.santos@rolim.com.br', password: 'Rogério@2026', role: 'MOTORISTA', document: '759.033.933-49' },
    { full_name: 'RONILSON NUNES GOMES', email: 'ronilson.gomes@rolim.com.br', password: 'Ronilson@2026', role: 'MOTORISTA', document: '753.835.863-34' },
    { full_name: 'WANDERLY MONTELES DA SILVA', email: 'wanderly.silva@rolim.com.br', password: 'Wanderly@2026', role: 'MOTORISTA', document: '013.421.323-86' },
    { full_name: 'CAROLINA DE JESUS SILVA DE ALMEIDA', email: 'carolina.almeida@rolim.com.br', password: 'Carolina@2026', role: 'GESTOR', document: '907.886.563-68' },
    { full_name: 'DANIEL BARBOSA MENEZES', email: 'daniel.menezes@rolim.com.br', password: 'Daniel@2026', role: 'GESTOR', document: '617.681.093-03' },
    { full_name: 'DIEGO LOPES RODRIGUES', email: 'diego.rodrigues@rolim.com.br', password: 'Diego@2026', role: 'GESTOR', document: '019.983.183-11' },
    { full_name: 'GRIGÓRIO SOBRINHO', email: 'grigório.sobrinho@rolim.com.br', password: 'Grigório@2026', role: 'GESTOR', document: '117.307.061-34' },
    { full_name: 'JOSÉ FERNANDO ROLIM', email: 'josé.rolim@rolim.com.br', password: 'José@2026', role: 'GESTOR', document: '016.703.813-31' },
    { full_name: 'JENIFFER DOS SANTOS DA LUZ', email: 'jeniffer.luz@rolim.com.br', password: 'Jeniffer@2026', role: 'GESTOR', document: '604-124-853-38' },
    { full_name: 'LAURENISE ARAUJO FERREIRA', email: 'laurenise.ferreira@rolim.com.br', password: 'Laurenise@2026', role: 'GESTOR', document: '622.257.813-62' },
    { full_name: 'LEONARDO SOUZA DE MELO', email: 'leonardo.melo@rolim.com.br', password: 'Leonardo@2026', role: 'GESTOR', document: '018.155.703-77' },
    { full_name: 'LORRANA BRAGA SOUSA', email: 'lorrana.sousa@rolim.com.br', password: 'Lorrana@2026', role: 'GESTOR', document: '616.046.243-10' },
    { full_name: 'LUCAS SILVA REGO', email: 'lucas.rego@rolim.com.br', password: 'Lucas@2026', role: 'GESTOR', document: '058.033.953-07' },
    { full_name: 'LUIS FERNANDO ARAUJO DO NASCIMENTO', email: 'luis.nascimento@rolim.com.br', password: 'Luis@2026', role: 'GESTOR', document: '045.703.343-69' },
    { full_name: 'PAULO LIMA DE ALENCAR NETO', email: 'paulo.neto@rolim.com.br', password: 'Paulo@2026', role: 'GESTOR', document: '039.324.023-16' },
    { full_name: 'RAUL FELIPE DO VALE LOPES', email: 'raul.lopes@rolim.com.br', password: 'Raul@2026', role: 'GESTOR', document: '617.527.435-42' },
    { full_name: 'CANDIDA MARIA SOUSA DA SILVA', email: 'candida.silva@rolim.com.br', password: 'Candida@2026', role: 'MOTORISTA', document: '024.652.473-10' },
    { full_name: 'CARLOS ALEANDRO DOS SANTOS', email: 'carlos.santos@rolim.com.br', password: 'Carlos@2026', role: 'MOTORISTA', document: '017.353.553-48' },
    { full_name: 'DIEGO LIMA DE SOUZA', email: 'diego.souza@rolim.com.br', password: 'Diego@2026', role: 'MOTORISTA', document: '024.359.713-46' },
    { full_name: 'EDNEY ARAUJO RIBEIRO', email: 'edney.ribeiro@rolim.com.br', password: 'Edney@2026', role: 'MOTORISTA', document: '012.558.553-55' },
    { full_name: 'ITADEU PEREIRA DE CARVALHO FILHO', email: 'itadeu.filho@rolim.com.br', password: 'Itadeu@2026', role: 'MOTORISTA', document: '043.041.023-97' },
    { full_name: 'JOAQUIM JORGE COELHO', email: 'joaquim.coelho@rolim.com.br', password: 'Joaquim@2026', role: 'MOTORISTA', document: '020.301.438-93' },
    { full_name: 'JOÃO GERSON GOMES SOARES', email: 'joão.soares@rolim.com.br', password: 'João@2026', role: 'MOTORISTA', document: '557.055.373-87' },
    { full_name: 'JOSÉ AGNALDO DA SILVA GADEIA', email: 'josé.gadeia@rolim.com.br', password: 'José@2026', role: 'MOTORISTA', document: '846.938.003-68' },
    { full_name: 'JOSE GERALDO SILVA NETO', email: 'jose.neto@rolim.com.br', password: 'Jose@2026', role: 'MOTORISTA', document: '001.537.833-03' },
    { full_name: 'LUIS CLAUDINO DOS SANTOS', email: 'luis.santos@rolim.com.br', password: 'Luis@2026', role: 'MOTORISTA', document: '107.162.463-68' },
    { full_name: 'MARCELO AMARAL MUNIZ', email: 'marcelo.muniz@rolim.com.br', password: 'Marcelo@2026', role: 'MOTORISTA', document: '626.063.603-20' },
    { full_name: 'MARCELO FAGUNDES PRADO SILVA', email: 'marcelo.silva@rolim.com.br', password: 'Marcelo@2026', role: 'MOTORISTA', document: '049.398.696-01' },
    { full_name: 'RAIMUNDO BATISTA DE LIMA', email: 'raimundo.lima@rolim.com.br', password: 'Raimundo@2026', role: 'MOTORISTA', document: '070.477.383-04' },
    { full_name: 'RAIMUNDO NONATO PRADO SILVA', email: 'raimundo.silva@rolim.com.br', password: 'Raimundo@2026', role: 'MOTORISTA', document: '489.598.203-34' },
    { full_name: 'RONALD DAS NEVES SILVA', email: 'ronald.silva@rolim.com.br', password: 'Ronald@2026', role: 'MOTORISTA', document: '040.601.873-13' },
    { full_name: 'GENILSON ROCHA DA SILVA', email: 'genilson.rocha@rolim.com', password: 'Genilson@2026', role: 'MOTORISTA', document: '954.040.233-68' }
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

async function fetchAllProfiles() {
    const res = await request('/rest/v1/profiles?select=email,full_name,role', 'GET');
    return Array.isArray(res.data) ? res.data : [];
}

async function deleteAuthUser(uid) {
    return request(`/auth/v1/admin/users/${uid}`, 'DELETE');
}

async function deleteProfileByEmail(email) {
    return request(`/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`, 'DELETE');
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
    console.log('=== SINCRONIZAÇÃO DE USUÁRIOS ===\n');

    // 1. DELEÇÃO
    console.log(`\n--- FASE 1: DELETANDO ${USERS_TO_DELETE.length} USUÁRIOS OBSOLETOS ---`);
    let deletedCount = 0;
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
            }
            await sleep(200);
        } catch (error) {
            console.error(`✗ Erro ao deletar ${email}:`, error.message);
        }
    }
    console.log(`Total deletado: ${deletedCount}/${USERS_TO_DELETE.length}`);

    // 2. SINCRONIZAÇÃO / CRIAÇÃO
    console.log(`\n--- FASE 2: SINCRONIZANDO ${USERS_TO_SYNC.length} USUÁRIOS ATIVOS ---`);
    let existingCount = 0;
    let createdCount = 0;
    let errorCount = 0;

    for (const user of USERS_TO_SYNC) {
        try {
            const uid = await fetchUserIdByEmail(user.email);
            if (uid) {
                existingCount++;
                process.stdout.write('.');
            } else {
                const result = await createAuthUser(user);
                if (result.success) {
                    console.log(`\n✓ Criado: ${user.email}`);
                    createdCount++;
                } else {
                    console.log(`\n✗ Erro ao criar ${user.email}:`, result.error);
                    errorCount++;
                }
            }
            await sleep(200);
        } catch (error) {
            console.error(`\n✗ Erro ao sincronizar ${user.email}:`, error.message);
            errorCount++;
        }
    }
    console.log(`\n\nTotal já existentes: ${existingCount}`);
    console.log(`Total criados: ${createdCount}`);
    console.log(`Total com erros: ${errorCount}`);

    // 3. AUDITORIA
    console.log(`\n--- FASE 3: AUDITORIA (Usuários Estranhos) ---`);
    const allProfiles = await fetchAllProfiles();
    const authorizedEmails = new Set(USERS_TO_SYNC.map(u => u.email.toLowerCase()));
    const strangers = allProfiles.filter(p => !authorizedEmails.has(p.email.toLowerCase()));

    if (strangers.length === 0) {
        console.log('✓ Nenhum usuário estranho encontrado. Base limpa!');
    } else {
        console.log(`⚠ Encontrados ${strangers.length} usuários fora da lista oficial:\n`);
        strangers.forEach(s => {
            console.log(`  - ${s.email} (${s.full_name}) [${s.role}]`);
        });
    }

    console.log('\n=== SINCRONIZAÇÃO CONCLUÍDA ===');
}

main().catch(console.error);
