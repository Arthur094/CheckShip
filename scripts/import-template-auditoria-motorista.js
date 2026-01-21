import https from 'https';

import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from './config.js';

// Settings padrão
const defaultSettings = {
    app_only: false,
    bulk_answer: true,
    share_email: true,
    allow_gallery: true,
    geo_fence_end: false,
    partial_result: true,
    geo_fence_start: false,
    mandatory_signature: true
};

// Gerar ID unico
function generateId() {
    return 'chk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Função auxiliar para criar config de item
function createItemConfig(anexoAtivo, options = [], selectionType = 'single') {
    const config = {
        hint: "",
        options: options,
        selection_options: options
    };

    if (selectionType) {
        config.selection_type = selectionType;
    }

    if (anexoAtivo) {
        config.allow_photo = true;
        config.allow_attachment = true;
    }

    return config;
}

// Template 1: Auditoria de Motorista | SSMA
const template1 = {
    id: generateId(),
    name: "Auditoria de Motorista | SSMA",
    subject: "Auditoria de Motorista",
    description: "Checklist de auditoria de conduta, apresentação e EPIs do motorista",
    settings: defaultSettings,
    structure: {
        areas: [
            {
                id: "area_conduta_epi",
                name: "Conduta, Apresentação e EPI",
                type: "Padrão",
                items: [
                    {
                        id: "nome_motorista",
                        name: "Nome do motorista",
                        type: "Texto",
                        config: createItemConfig(true)
                    },
                    {
                        id: "estado_fisico_psicologico",
                        name: "O motorista aparenta estar bem física e psicologicamente (sem sinais de sonolência, embriaguez, olhos vermelhos ou vestes desordenadas)",
                        type: "Avaliativo",
                        config: createItemConfig(true)
                    },
                    {
                        id: "teste_bafometro",
                        name: "Teste do bafômetro",
                        type: "Avaliativo",
                        config: createItemConfig(true)
                    },
                    {
                        id: "condicoes_uniforme",
                        name: "Condições do Uniforme",
                        type: "Avaliativo",
                        config: createItemConfig(true)
                    },
                    {
                        id: "calcado_seguranca",
                        name: "Calçado de segurança",
                        type: "Avaliativo",
                        config: createItemConfig(true)
                    },
                    {
                        id: "colete_refletivo",
                        name: "Colete refletivo",
                        type: "Avaliativo",
                        config: createItemConfig(true)
                    },
                    {
                        id: "oculos_protecao",
                        name: "Óculos de proteção",
                        type: "Avaliativo",
                        config: createItemConfig(true)
                    },
                    {
                        id: "capacete_jugular",
                        name: "Capacete com jugular (aranha)",
                        type: "Avaliativo",
                        config: createItemConfig(true)
                    },
                    {
                        id: "viseira",
                        name: "Viseira",
                        type: "Avaliativo",
                        config: createItemConfig(true)
                    },
                    {
                        id: "luvas",
                        name: "Luvas",
                        type: "Avaliativo",
                        config: createItemConfig(true)
                    },
                    {
                        id: "luva_reserva",
                        name: "Luva reserva",
                        type: "Avaliativo",
                        config: createItemConfig(true)
                    },
                    {
                        id: "avental",
                        name: "Avental",
                        type: "Avaliativo",
                        config: createItemConfig(true)
                    },
                    {
                        id: "cinto_paraquedista",
                        name: "Cinto Paraquedista (quando aplicável)",
                        type: "Avaliativo",
                        config: createItemConfig(true)
                    }
                ],
                sub_areas: []
            }
        ]
    },
    target_vehicle_types: [],
    assigned_user_ids: []
};

// Função para criar template no Supabase
async function createTemplate(template) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SUPABASE_URL.replace('https://', ''),
            path: '/rest/v1/checklist_templates',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Prefer': 'return=representation'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    const result = JSON.parse(data);
                    resolve(result[0]);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.write(JSON.stringify(template));
        req.end();
    });
}

// Delay entre requests
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Executar importação
async function importTemplates() {
    const templates = [template1];

    console.log(`\n🚀 Iniciando importação de ${templates.length} template(s)...\n`);

    let success = 0;
    let errors = 0;

    for (const template of templates) {
        try {
            console.log(`📝 Criando: ${template.name}...`);
            const result = await createTemplate(template);
            console.log(`✅ Sucesso! ID: ${result.id}\n`);
            success++;
            await sleep(500); // Delay entre requests
        } catch (error) {
            console.error(`❌ Erro ao criar "${template.name}":`, error.message, '\n');
            errors++;
        }
    }

    console.log(`\n📊 Resumo:`);
    console.log(`   ✅ Sucesso: ${success}`);
    console.log(`   ❌ Erros: ${errors}`);
    console.log(`   📋 Total: ${templates.length}\n`);
}

importTemplates();
