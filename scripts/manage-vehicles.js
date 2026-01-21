import https from 'https';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from './config.js';


// IDs dos tipos de veículos
const VEHICLE_TYPE_IDS = {
    'Transferência': '2932c095-6c9d-42a7-8a8a-b2e52dd4f807',
    'Programação': '936cddac-2335-4278-b3b9-dce24803e745',
    'QAV': '4aa572f8-2a04-41ac-b4f1-9bd1180b4813',
    'BPF': 'b31f38e3-5cfa-4bf5-ac42-00a18405412d',
    'Caminhão': '6b262e54-8935-4af2-9a9d-a77b6ae5e67d'
};

// Placas por tipo
const PLATES_BY_TYPE = {
    'Transferência': ['SNI4F95', 'SNI5E89', 'SMW4B56', 'SMW4B48', 'ROP 6G92', 'SMN7B29', 'SMN7B33', 'SMN7B35', 'SMN7B22', 'SNJ9G31', 'SNJ9G35', 'SNJ9G38', 'ROW8A29', 'SMQ1F73', 'ROW8A38', 'ROY5J60', 'PTV0B49', 'PTT 0E62', 'PTT 0E23', 'ROF 0B51', 'ROF 0B59', 'PSF 8495', 'PRX 4A87', 'OXT9598', 'OXR 0717', 'PRV 8A85', 'NWX1657', 'OJI3145', 'OJB4648', 'MWV6J86', 'NXI3883', 'OXQ6883', 'NWW4199'],
    'Programação': ['SNG2H07', 'ROY6H96', 'ROV7B66', 'ROV7B70', 'ROV7B60', 'SNG2F98', 'PTO9692', 'PSE6415', 'SMR3A89', 'RON2I54', 'RON2I58', 'PSX8E66', 'ROJ9D56'],
    'QAV': ['ROJ9D44', 'PSY5076', 'ROV6J52', 'RIL2G94'],
    'BPF': ['MVW8A59', 'OJI3145', 'OXV9304', 'NHC4570']
};

// Atribuições específicas usuário-veículo
const SPECIFIC_ASSIGNMENTS = {
    'abmael.silva@rolim.com.br': ['ROV7B70'],
    'adeilson.santos@rolim.com.br': ['RON2I58'],
    'aldenor.anjos@rolim.com.br': ['ROJ9D56'],
    'antonio.dutra@rolim.com.br': ['SNJ9G35'],
    'antonio.bezerra@rolim.com.br': ['SMQ1F73'],
    'antonio.silva@rolim.com.br': ['SNJ9G31'],
    'arnaildes.lima@rolim.com.br': ['ROV7B60'],
    'cosmidan.pereira@rolim.com.br': ['ROY6H96'],
    'edson.costa@rolim.com.br': ['RIL2G94'],
    'francisco.lobo@rolim.com.br': ['ROF 0B59'],
    'francisco.pessoa@rolim.com.br': ['PRV 8A85'],
    'francisco.pereira@rolim.com.br': ['SNG2H07'],
    'genegilson.sousa@rolim.com.br': ['ROF 0B51'],
    'george.sousa@rolim.com.br': ['SMN7B29'],
    'grigorio.costa@rolim.com.br': ['RON2I54'],
    'grunewaldo.oliveira@rolim.com.br': ['PSE6415'],
    'gustavo.cardoso@rolim.com.br': ['SMN7B22'],
    'ian.santana@rolim.com.br': ['ROV7B70'],
    'joneide.azevedo@rolim.com.br': ['SNI4F95'],
    'jose.pereira@rolim.com.br': ['ROP 6G92'],
    'jose.silva@rolim.com.br': ['SNI5E89'],
    'juarez.silva@rolim.com.br': ['ROV6J52'],
    'luis.teixeira@rolim.com.br': ['SMN7B33'],
    'luis.carlos@rolim.com': ['SMN7B33'],
    'maklawd.silva@rolim.com.br': ['ROV7B66'],
    'manoel.neto@rolim.com.br': ['SMW4B56'],
    'marcos.miranda@rolim.com.br': ['ROJ9D44'],
    'mario.filho@rolim.com.br': ['SMN7B35'],
    'raimundo.neto@rolim.com.br': ['PSY5076'],
    'reginaldo.santos@rolim.com.br': ['SNJ9G38'],
    'richard.torres@rolim.com.br': ['PSF 8495'],
    'roberto.santos@rolim.com.br': ['ROW8A38'],
    'rogerio.santos@rolim.com.br': ['ROY5J60'],
    'ronilson.gomes@rolim.com.br': ['SMR3A89'],
    'wanderly.silva@rolim.com.br': ['ROW8A29']
};

// Usuários com atribuições por tipo
const TYPE_BASED_ASSIGNMENTS = {
    'derisvaldo.silva@rolim.com.br': ['Programação'],
    'antonio.filho@rolim.com.br': ['Transferência'],
    'micernandes.fernandes@rolim.com.br': ['Transferência'],
    'roberto.silva@rolim.com.br': ['Programação', 'BPF'],
    'candida.silva@rolim.com.br': ['Programação'],
    'carlos.santos@rolim.com.br': ['Programação'],
    'diego.souza@rolim.com.br': ['Programação'],
    'edney.ribeiro@rolim.com.br': ['Programação'],
    'itadeu.filho@rolim.com.br': ['Programação'],
    'joaquim.coelho@rolim.com.br': ['QAV', 'Transferência'],
    'joao.soares@rolim.com.br': ['Programação'],
    'jose.gadeia@rolim.com.br': ['Transferência'],
    'marcelo.muniz@rolim.com.br': ['Programação'],
    'marcelo.silva@rolim.com.br': ['Programação'],
    'raimundo.lima@rolim.com.br': ['Programação'],
};

// Usuários que recebem TODAS as placas
const ALL_VEHICLES_USERS = [
    'genilson.silva@rolim.com.br',
    'jose.neto@rolim.com.br',
    'luis.santos@rolim.com.br',
    'raimundo.silva@rolim.com.br',
    'ronald.silva@rolim.com.br',
    'genilson.rocha@rolim.com'
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

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --- FUNÇÕES PRINCIPAIS ---

async function main() {
    console.log('=== GERENCIAMENTO DE VEÍCULOS E ATRIBUIÇÕES ===\n');

    // 1. Verificar e criar/atualizar veículos
    console.log('--- FASE 1: Verificando e atualizando veículos ---');
    const vehiclesMap = await processVehicles();

    // 2. Criar atribuições
    console.log('\n--- FASE 2: Criando atribuições de veículos ---');
    await createAssignments(vehiclesMap);

    // 3. Listar veículos tipo Caminhão
    console.log('\n--- FASE 3: Listando veículos tipo Caminhão ---');
    await listTruckVehicles();

    console.log('\n=== PROCESSO CONCLUÍDO ===');
}

async function processVehicles() {
    const vehiclesMap = {};

    // Buscar todos os veículos existentes
    const res = await request('/rest/v1/vehicles?select=id,plate,vehicle_type_id', 'GET');
    const existingVehicles = res.data || [];

    // Criar mapa de placas existentes
    const existingPlatesMap = {};
    existingVehicles.forEach(v => {
        existingPlatesMap[v.plate.toUpperCase()] = v;
    });

    // Processar cada tipo
    for (const [typeName, plates] of Object.entries(PLATES_BY_TYPE)) {
        const typeId = VEHICLE_TYPE_IDS[typeName];
        console.log(`\nProcessando tipo: ${typeName}`);

        for (const plate of plates) {
            const normalizedPlate = plate.toUpperCase();

            if (existingPlatesMap[normalizedPlate]) {
                // Veículo existe - atualizar tipo se necessário
                const vehicle = existingPlatesMap[normalizedPlate];
                if (vehicle.vehicle_type_id !== typeId) {
                    await request(`/rest/v1/vehicles?id=eq.${vehicle.id}`, 'PATCH', {
                        vehicle_type_id: typeId
                    });
                    console.log(`  ✓ Atualizado tipo: ${plate}`);
                } else {
                    console.log(`  • Já correto: ${plate}`);
                }
                vehiclesMap[normalizedPlate] = { ...vehicle, vehicle_type_id: typeId, type_name: typeName };
            } else {
                // Criar novo veículo
                const newVehicle = {
                    plate: plate,
                    model: 'PADRÃO',
                    vehicle_type_id: typeId,
                    status: 'ATIVO',
                    active: true
                };
                const createRes = await request('/rest/v1/vehicles', 'POST', newVehicle);
                if (createRes.statusCode >= 200 && createRes.statusCode < 300) {
                    console.log(`  ✓ Criado: ${plate}`);
                    vehiclesMap[normalizedPlate] = { ...createRes.data[0], type_name: typeName };
                } else {
                    console.log(`  ✗ Erro ao criar ${plate}`);
                }
            }
            await sleep(100);
        }
    }

    return vehiclesMap;
}

async function createAssignments(vehiclesMap) {
    // Buscar todos os perfis
    const profilesRes = await request('/rest/v1/profiles?select=id,email', 'GET');
    const profiles = profilesRes.data || [];
    const profilesMap = {};
    profiles.forEach(p => profilesMap[p.email] = p.id);

    // Limpar atribuições existentes
    console.log('\nLimpando atribuições antigas...');
    await request('/rest/v1/vehicle_assignments', 'DELETE');

    const assignments = [];

    // 1. Atribuições específicas
    console.log('\nCriando atribuições específicas...');
    for (const [email, plates] of Object.entries(SPECIFIC_ASSIGNMENTS)) {
        const profileId = profilesMap[email];
        if (!profileId) {
            console.log(`  ⚠ Usuário não encontrado: ${email}`);
            continue;
        }

        for (const plate of plates) {
            const vehicle = vehiclesMap[plate.toUpperCase()];
            if (vehicle) {
                assignments.push({
                    profile_id: profileId,
                    vehicle_id: vehicle.id,
                    active: true
                });
            }
        }
    }

    // 2. Atribuições baseadas em tipo
    console.log('Criando atribuições por tipo...');
    for (const [email, types] of Object.entries(TYPE_BASED_ASSIGNMENTS)) {
        const profileId = profilesMap[email];
        if (!profileId) {
            console.log(`  ⚠ Usuário não encontrado: ${email}`);
            continue;
        }

        for (const typeName of types) {
            const typePlates = PLATES_BY_TYPE[typeName] || [];
            for (const plate of typePlates) {
                const vehicle = vehiclesMap[plate.toUpperCase()];
                if (vehicle) {
                    assignments.push({
                        profile_id: profileId,
                        vehicle_id: vehicle.id,
                        active: true
                    });
                }
            }
        }
    }

    // 3. Usuários com todas as placas
    console.log('Criando atribuições para todos os veículos...');
    for (const email of ALL_VEHICLES_USERS) {
        const profileId = profilesMap[email];
        if (!profileId) {
            console.log(`  ⚠ Usuário não encontrado: ${email}`);
            continue;
        }

        for (const vehicle of Object.values(vehiclesMap)) {
            assignments.push({
                profile_id: profileId,
                vehicle_id: vehicle.id,
                active: true
            });
        }
    }

    // 4. Demais usuários (MOTORISTAS) recebem todas as placas
    console.log('Atribuindo todos os veículos aos demais motoristas...');
    const processedEmails = new Set([
        ...Object.keys(SPECIFIC_ASSIGNMENTS),
        ...Object.keys(TYPE_BASED_ASSIGNMENTS),
        ...ALL_VEHICLES_USERS
    ]);

    const remainingDrivers = profiles.filter(p =>
        p.email.includes('@rolim.com') &&
        !processedEmails.has(p.email)
    );

    for (const profile of remainingDrivers) {
        for (const vehicle of Object.values(vehiclesMap)) {
            assignments.push({
                profile_id: profile.id,
                vehicle_id: vehicle.id,
                active: true
            });
        }
    }

    // Inserir atribuições em lotes
    console.log(`\nInserindo ${assignments.length} atribuições...`);
    const batchSize = 100;
    for (let i = 0; i < assignments.length; i += batchSize) {
        const batch = assignments.slice(i, i + batchSize);
        await request('/rest/v1/vehicle_assignments', 'POST', batch);
        process.stdout.write('.');
        await sleep(200);
    }
    console.log('\n✓ Atribuições criadas!');
}

async function listTruckVehicles() {
    const truckTypeId = VEHICLE_TYPE_IDS['Caminhão'];
    const res = await request(`/rest/v1/vehicles?vehicle_type_id=eq.${truckTypeId}&select=plate,model`, 'GET');
    const trucks = res.data || [];

    console.log(`\nVeículos tipo Caminhão (${trucks.length}):`);
    trucks.forEach(t => {
        console.log(`  - ${t.plate} (${t.model || 'Sem modelo'})`);
    });
}

main().catch(console.error);
