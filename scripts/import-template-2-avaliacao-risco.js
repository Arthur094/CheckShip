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
    name: "Avaliação de Risco - Cliente | SSMA",
    subject: "Avaliação de Risco",
    description: "Avaliação de riscos e condições de segurança em instalações de clientes",
    settings: settings,
    structure: {
        areas: [
            {
                id: "area_informacoes",
                name: "Informações",
                type: "Padrão",
                items: [
                    {
                        id: "data_inspecao",
                        name: "Data de Inspeção",
                        type: "Data",
                        config: { hint: "", options: [], selection_options: [] }
                    },
                    {
                        id: "endereco",
                        name: "Endereço",
                        type: "Texto",
                        config: { hint: "", options: [], selection_options: [] }
                    },
                    {
                        id: "nome_posto",
                        name: "Nome do Posto",
                        type: "Texto",
                        config: { hint: "", options: [], selection_options: [] }
                    },
                    {
                        id: "layout_posto",
                        name: "Layout do Posto",
                        type: "Texto",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    }
                ],
                sub_areas: []
            },
            {
                id: "area_condicoes",
                name: "Condições Expostas",
                type: "Padrão",
                items: [
                    {
                        id: "acesso_ct",
                        name: "Condições de acesso ao Caminhão Tanque",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "afastamentos",
                        name: "Tanques foram instalados com afastamentos para edificações, divisa de propriedade e vias públicas",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "controle_enchimento",
                        name: "Controle de limitação de enchimento de tanques",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "capacidade_manobra",
                        name: "Capacidade de manobra do Caminhão Tanque",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "piso_impermeabilizado",
                        name: "Locais de abastecimento estão com piso impermeabilizado tanto na área dos tanques quanto na área de abastecimento",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "canaletas",
                        name: "Há canaletas metálicas de contenção do escoamento de combustíveis que circundem tanto a área dos tanques quanto a área de abastecimento",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "aterramento",
                        name: "Nos locais de descarga de combustível existe ponto de aterramento apropriado, conforme a NR 10 do MTE, para se descarregar a energia estática dos carros transportadores",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "deposito_residuos",
                        name: "Depósito de resíduos adequado (acondicionamento do lixo)",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "ambiente_limpo",
                        name: "Ambiente livre de materiais estranhos ou em desuso",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "sinalizacao_proibido_fumar",
                        name: "Há sinalização(ões) de proibição do tipo \"proibido fumar\" na área de abastecimento",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "sinalizacao_emergencia",
                        name: "Verificar se há sinalização(ões) de Emergência na área de abastecimento",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "recursos_combate",
                        name: "Instalações possuem recursos de combate a incêndio e emergência",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "instalacoes_eletricas",
                        name: "Instalações e conexões elétricas estão em boas condições visuais",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "instalacoes_sanitarias",
                        name: "Instalações sanitárias dos trabalhadores atende quanto: higiene/limpeza gênero e quantidade de usuários",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "glp_conformidade",
                        name: "Verificar, em caso de haver revenda de GLP no posto de abastecimento, se está em conformidade",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "observacao",
                        name: "Observação/Depoimento",
                        type: "Texto",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    }
                ],
                sub_areas: []
            },
            {
                id: "area_melhoria",
                name: "Sugestão de Melhoria",
                type: "Padrão",
                items: [
                    {
                        id: "melhoria_sugestao",
                        name: "Melhoria na qualidade dos produtos ou serviços",
                        type: "Texto",
                        config: { hint: "Exponha a condição exposta e melhoria sugerida", options: [], selection_options: [] }
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
console.log('Itens:', template.structure.areas.reduce((sum, a) => sum + a.items.length, 0), '\n');

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
