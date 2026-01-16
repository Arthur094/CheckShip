import fs from 'fs';
import csv from 'csv-parser';
import https from 'https';

// Configuracao Supabase
const SUPABASE_URL = 'https://thztbankqpgtgiknzkaw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoenRiYW5rcXBndGdpa256a2F3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkxNzY5OSwiZXhwIjoyMDgzNDkzNjk5fQ.XfJy9FlkUm1FV5EKs73Lfc8peOlLB5go3h0-SFYbdRs';

// Lista para armazenar veiculos do CSV
const vehicles = [];

// Ler CSV
fs.createReadStream('veiculos.csv')
    .pipe(csv())
    .on('data', (row) => {
        vehicles.push(row);
    })
    .on('end', async () => {
        console.log(`Veiculos encontrados no CSV: ${vehicles.length}`);
        console.log('Iniciando importacao...\n');

        let success = 0;
        let errors = 0;

        for (const vehicle of vehicles) {
            try {
                await createVehicle(vehicle);
                success++;
                console.log(`OK ${vehicle.plate} criado com sucesso (${success}/${vehicles.length})`);
            } catch (error) {
                errors++;
                console.error(`ERRO ${vehicle.plate} falhou:`, error.message);
            }

            // Delay para nao sobrecarregar a API
            await sleep(300);
        }

        console.log('\nImportacao concluida!');
        console.log(`   Sucesso: ${success}`);
        console.log(`   Erros: ${errors}`);
    });

// Funcao para criar veiculo via Supabase REST API
async function createVehicle(vehicle) {
    const { plate, model, type } = vehicle;

    // Primeiro, verificar se o tipo de veiculo existe
    const vehicleTypeId = await getOrCreateVehicleType(type);

    const payload = {
        plate: plate.toUpperCase(),
        model: model || 'PADRAO',
        vehicle_type_id: vehicleTypeId,
        status: 'active'
    };

    const options = {
        hostname: SUPABASE_URL.replace('https://', ''),
        path: '/rest/v1/vehicles',
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

// Cache de tipos de veiculos
const vehicleTypeCache = {};

// Funcao para obter ou criar tipo de veiculo
async function getOrCreateVehicleType(typeName) {
    // Verificar cache
    if (vehicleTypeCache[typeName]) {
        return vehicleTypeCache[typeName];
    }

    // Tentar buscar tipo existente
    const existingType = await findVehicleType(typeName);
    if (existingType) {
        vehicleTypeCache[typeName] = existingType;
        return existingType;
    }

    // Criar novo tipo
    const newTypeId = await createVehicleType(typeName);
    vehicleTypeCache[typeName] = newTypeId;
    return newTypeId;
}

// Funcao para buscar tipo de veiculo
async function findVehicleType(typeName) {
    const options = {
        hostname: SUPABASE_URL.replace('https://', ''),
        path: `/rest/v1/vehicle_types?name=eq.${encodeURIComponent(typeName)}&select=id`,
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
                    const types = JSON.parse(data);
                    resolve(types.length > 0 ? types[0].id : null);
                } else {
                    resolve(null);
                }
            });
        });

        req.on('error', () => resolve(null));
        req.end();
    });
}

// Funcao para criar tipo de veiculo
async function createVehicleType(typeName) {
    const payload = {
        name: typeName,
        description: `Tipo ${typeName}`,
        active: true
    };

    const options = {
        hostname: SUPABASE_URL.replace('https://', ''),
        path: '/rest/v1/vehicle_types',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Prefer': 'return=representation'
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
                    const types = JSON.parse(data);
                    resolve(types[0].id);
                } else {
                    reject(new Error(`Falha ao criar tipo: ${data}`));
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
