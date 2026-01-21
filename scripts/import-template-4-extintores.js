import https from 'https';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from './config.js';


const settings = {
    app_only: false,
    bulk_answer: true,
    share_email: true,
    allow_gallery: true,
    geo_fence_end: false,
    partial_result: true,
    geo_fence_start: false,
    mandatory_signature: true
};

function generateId() {
    return 'chk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

const template = {
    id: generateId(),
    name: "Inspeção dos Extintores | Brigada SSMA",
    subject: "Inspeção de Extintores",
    description: "Checklist de inspeção de extintores, sinalização de emergência e condições de segurança",
    settings: settings,
    structure: {
        areas: [
            {
                id: "area_brigada",
                name: "Brigada de Emergência",
                type: "Padrão",
                items: [
                    {
                        id: "nome_brigadista",
                        name: "Nome do Brigadista",
                        type: "Texto",
                        config: { hint: "", options: [], selection_options: [] }
                    }
                ],
                sub_areas: [
                    {
                        id: "subarea_sinalizacao",
                        name: "Sinalização de saída de emergência e ponto de encontro",
                        items: [
                            {
                                id: "placa_saida_salas",
                                name: "Placa de saída de emergência das salas",
                                type: "Avaliativo",
                                config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                            },
                            {
                                id: "placa_saida_predial",
                                name: "Placa indicativa de saída no predial",
                                type: "Avaliativo",
                                config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                            },
                            {
                                id: "placa_ponto_encontro",
                                name: "Placa de ponto de encontro",
                                type: "Avaliativo",
                                config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                            }
                        ]
                    },
                    {
                        id: "subarea_extintor_info",
                        name: "Extintor",
                        items: [
                            {
                                id: "localizacao_extintor",
                                name: "Localização do Extintor",
                                type: "Texto",
                                config: { hint: "", options: [], selection_options: [] }
                            },
                            {
                                id: "tipo_extintor",
                                name: "Tipo de Extintor",
                                type: "Texto",
                                config: { hint: "", options: [], selection_options: [] }
                            },
                            {
                                id: "proxima_manutencao",
                                name: "Próxima Manutenção",
                                type: "Data",
                                config: { hint: "", options: [], selection_options: [] }
                            }
                        ]
                    }
                ]
            },
            {
                id: "area_inspecao",
                name: "Inspeção",
                type: "Padrão",
                items: [
                    {
                        id: "carga_recarga",
                        name: "Carga / Recarga",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "pintura",
                        name: "Pintura",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "lacre",
                        name: "Lacre",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "manometro",
                        name: "Manômetro",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "bico_difusor",
                        name: "Bico ou difusor",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "punho",
                        name: "Punho",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "alavanca_pistola",
                        name: "Alavanca/pistola",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "suporte_piso",
                        name: "Suporte no piso",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "boa_sinalizacao",
                        name: "Boa sinalização",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "extintor_desobstruido",
                        name: "Extintor desobstruído",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "protecao_intemperies",
                        name: "Proteção intempéries",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "bem_fixado",
                        name: "Está bem fixado",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "adequado_classe",
                        name: "Adequado classe do fogo",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    }
                ],
                sub_areas: []
            }
        ]
    },
    target_vehicle_types: [],
    assigned_user_ids: []
};

console.log('Criando template:', template.name);
console.log('Áreas:', template.structure.areas.length);
const totalItems = template.structure.areas.reduce((sum, area) => {
    const areaItems = area.items.length;
    const subItems = area.sub_areas.reduce((subSum, sub) => subSum + sub.items.length, 0);
    return sum + areaItems + subItems;
}, 0);
console.log('Itens:', totalItems, '\n');

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
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            const result = JSON.parse(data);
            console.log('✅ SUCESSO! ID:', result[0].id);
        } else {
            console.error('❌ ERRO:', res.statusCode, data);
        }
    });
});

req.on('error', (error) => console.error('❌ Erro:', error.message));
req.write(JSON.stringify(template));
req.end();
