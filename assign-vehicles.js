import fs from 'fs';
import csv from 'csv-parser';
import https from 'https';

// Configuracao Supabase
const SUPABASE_URL = 'https://thztbankqpgtgiknzkaw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoenRiYW5rcXBndGdpa256a2F3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkxNzY5OSwiZXhwIjoyMDgzNDkzNjk5fQ.XfJy9FlkUm1FV5EKs73Lfc8peOlLB5go3h0-SFYbdRs';

// Lista para armazenar atribuicoes do CSV
const assignments = [];

console.log('Lendo arquivo CSV...\n');

// Ler CSV
fs.createReadStream('atribuicoes-veiculos.csv')
    .pipe(csv())
    .on('data', (row) => {
        assignments.push(row);
    })
    .on('end', async () => {
        console.log(`Atribuicoes encontradas no CSV: ${assignments.length}`);
        console.log('Iniciando atribuicao de veiculos...\n');

        let success = 0;
        let errors = 0;
        const errorDetails = [];

        for (const assignment of assignments) {
            try {
                await assignVehicleToDriver(assignment.plate, assignment.email);
                success++;
                console.log(`OK ${assignment.plate} -> ${assignment.email} (${success}/${assignments.length})`);
            } catch (error) {
                errors++;
                errorDetails.push({ plate: assignment.plate, email: assignment.email, error: error.message });
                console.error(`ERRO ${assignment.plate} -> ${assignment.email}: ${error.message}`);
            }

            // Delay para nao sobrecarregar a API
            await sleep(300);
        }

        console.log('\n--- Resultado da Atribuicao ---');
        console.log(`Sucesso: ${success}`);
        console.log(`Erros: ${errors}`);

        if (errorDetails.length > 0) {
            console.log('\n--- Detalhes dos Erros ---');
            errorDetails.forEach(err => {
                console.log(`  ${err.plate} -> ${err.email}: ${err.error}`);
            });
        }
    });

// Funcao para atribuir veiculo a motorista
async function assignVehicleToDriver(plate, email) {
    // 1. Buscar ID do veiculo pela placa
    const vehicleId = await findVehicleByPlate(plate);
    if (!vehicleId) {
        throw new Error(`Veiculo com placa ${plate} nao encontrado`);
    }

    // 2. Buscar ID do usuario pelo email
    const userId = await findUserByEmail(email);
    if (!userId) {
        throw new Error(`Usuario com email ${email} nao encontrado`);
    }

    // 3. Verificar se ja existe atribuicao
    const existingAssignment = await findExistingAssignment(vehicleId, userId);
    if (existingAssignment) {
        console.log(`  (ja atribuido)`);
        return; // Nao falha, apenas pula
    }

    // 4. Criar atribuicao
    await createAssignment(vehicleId, userId);
}

// Buscar veiculo pela placa
async function findVehicleByPlate(plate) {
    const options = {
        hostname: SUPABASE_URL.replace('https://', ''),
        path: `/rest/v1/vehicles?plate=eq.${encodeURIComponent(plate.toUpperCase())}&select=id`,
        method: 'GET',
        headers: {
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

            res.on('end', () => {
                if (res.statusCode === 200) {
                    const vehicles = JSON.parse(data);
                    resolve(vehicles.length > 0 ? vehicles[0].id : null);
                } else {
                    resolve(null);
                }
            });
        });

        req.on('error', () => resolve(null));
        req.end();
    });
}

// Buscar usuario pelo email
async function findUserByEmail(email) {
    const options = {
        hostname: SUPABASE_URL.replace('https://', ''),
        path: `/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=id`,
        method: 'GET',
        headers: {
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

            res.on('end', () => {
                if (res.statusCode === 200) {
                    const users = JSON.parse(data);
                    resolve(users.length > 0 ? users[0].id : null);
                } else {
                    resolve(null);
                }
            });
        });

        req.on('error', () => resolve(null));
        req.end();
    });
}

// Verificar se atribuicao ja existe
async function findExistingAssignment(vehicleId, userId) {
    const options = {
        hostname: SUPABASE_URL.replace('https://', ''),
        path: `/rest/v1/vehicle_assignments?vehicle_id=eq.${vehicleId}&profile_id=eq.${userId}&select=id`,
        method: 'GET',
        headers: {
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

            res.on('end', () => {
                if (res.statusCode === 200) {
                    const assignments = JSON.parse(data);
                    resolve(assignments.length > 0);
                } else {
                    resolve(false);
                }
            });
        });

        req.on('error', () => resolve(false));
        req.end();
    });
}

// Criar atribuicao
async function createAssignment(vehicleId, userId) {
    const payload = {
        vehicle_id: vehicleId,
        profile_id: userId,  // CORRETO: profile_id, não user_id
        assigned_at: new Date().toISOString()
    };

    const options = {
        hostname: SUPABASE_URL.replace('https://', ''),
        path: '/rest/v1/vehicle_assignments',
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
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve();
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
