import https from 'https';

const SUPABASE_URL = 'https://thztbankqpgtgiknzkaw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoenRiYW5rcXBndGdpa256a2F3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkxNzY5OSwiZXhwIjoyMDgzNDkzNjk5fQ.XfJy9FlkUm1FV5EKs73Lfc8peOlLB5go3h0-SFYbdRs';

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
    name: "Inspeção Invisível | SSMA",
    subject: "Inspeção Invisível",
    description: "Inspeção de conformidade durante transporte - verificação de EPIs, condições do veículo e conduta do motorista",
    settings: settings,
    structure: {
        areas: [
            {
                id: "area_informacoes",
                name: "Informações",
                type: "Padrão",
                items: [
                    {
                        id: "condutor",
                        name: "Condutor",
                        type: "Texto",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "unidade",
                        name: "Unidade",
                        type: "Lista de Seleção",
                        config: { hint: "", options: ["São Luis", "Teresina"], selection_type: "single", selection_options: ["São Luis", "Teresina"] }
                    },
                    {
                        id: "rota",
                        name: "Rota",
                        type: "Texto",
                        config: { hint: "", options: [], selection_options: [] }
                    }
                ],
                sub_areas: []
            },
            {
                id: "area_avaliados",
                name: "ITENS AVALIADOS",
                type: "Padrão",
                items: [
                    {
                        id: "epis",
                        name: "O condutor está utilizando todos EPI's: óculos, capacete, jugular, bota, luvas e fardamento em perfeito estado de conservação?",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [] }
                    },
                    {
                        id: "veiculo_limpo",
                        name: "O veiculo está limpo?",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "farois",
                        name: "Os faróis estão em funcionamento?",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "condicao_fisica",
                        name: "Qual a condição física do veiculo?",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "placas_produto",
                        name: "As placas informando o produto que está sendo carregado está condizente com o produto armazenado?",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "placas_risco",
                        name: "As placas de sinalização de risco do produto está visível?",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "faixa_direita",
                        name: "O condutor está transitando pela faixa da direita?",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "sozinho_cabine",
                        name: "O condutor está sozinho na cabine?",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "ultrapassagens",
                        name: "O condutor realiza ultrapassagens pela faixa esquerda?",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "faixa_pedestre",
                        name: "O condutor para em faixas para passagem de pedestres?",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "respeita_sinalizacao",
                        name: "O condutor respeita as sinalizações de transito?",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "translado_rotograma",
                        name: "O condutor realiza o translado previsto em rotograma?",
                        type: "Avaliativo",
                        config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true }
                    },
                    {
                        id: "descarga_procedimento",
                        name: "O condutor realiza a descarga de acordo com procedimento?",
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
