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
    name: "Inspeção no Ambiente de Trabalho INFRAESTRUTURA | SSMA",
    subject: "Inspeção de Infraestrutura",
    description: "Inspeção de infraestrutura de garagem e instalações - segurança, controle de acesso, abastecimento e manutenção",
    settings: settings,
    structure: {
        areas: [
            {
                id: "area_responsavel",
                name: "RESPONSÁVEL PELA INSPEÇÃO",
                type: "Padrão",
                items: [
                    { id: "nome", name: "NOME:", type: "Lista de Seleção", config: { hint: "", options: ["Jeniffer Luz", "Laurenise Araújo", "Lorrana Braga Sousa"], selection_type: "single", selection_options: ["Jeniffer Luz", "Laurenise Araújo", "Lorrana Braga Sousa"], allow_photo: true, allow_attachment: true } },
                    { id: "funcao", name: "FUNÇÃO", type: "Lista de Seleção", config: { hint: "", options: ["Auxiliar de SSMAQ", "Gestora de SSMAQ", "Técnico de Segurança do Trabalho"], selection_type: "single", selection_options: ["Auxiliar de SSMAQ", "Gestora de SSMAQ", "Técnico de Segurança do Trabalho"], allow_photo: true, allow_attachment: true } }
                ],
                sub_areas: []
            },
            {
                id: "area_instalacoes",
                name: "1. INSTALAÇÕES E SEGURANÇA GERAL",
                type: "Padrão",
                items: [
                    { id: "iluminacao", name: "1.1 Há iluminação adequada nas áreas internas e externas da garagem?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "cerca_protecao", name: "1.2 Existe cerca de proteção ou barreira física ao redor do pátio?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "cftv", name: "1.3 O sistema de CFTV (câmeras de segurança) está funcionando corretamente?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "seguranca_patrimonial", name: "1.4 Há presença de segurança patrimonial no local?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "procedimentos_seguranca", name: "1.5 Existem procedimentos de segurança documentados e divulgados aos colaboradores?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } }
                ],
                sub_areas: []
            },
            {
                id: "area_acesso",
                name: "2. CONTROLE DE ACESSO",
                type: "Padrão",
                items: [
                    { id: "controle_entrada", name: "2.1 Há controle de entrada e saída de pessoas e veículos na garagem?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "registro_visitantes", name: "2.2 Existe registro de visitantes e prestadores de serviço?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "portao_vigilancia", name: "2.3 O portão de acesso está em bom estado e com vigilância adequada?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } }
                ],
                sub_areas: []
            },
            {
                id: "area_abastecimento",
                name: "3. ÁREA DE ABASTECIMENTO (APLICÁVEL SE EXISTENTE)",
                type: "Padrão",
                items: [
                    { id: "tanques_aterrados", name: "3.1 Os tanques de armazenagem estão aterrados e em área contida?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "bombas_filtros", name: "3.2 As bombas e filtros estão em boas condições e sem vazamentos?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "area_contida", name: "3.3 A área contida direciona efluentes para uma caixa separadora?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "plano_emergencia", name: "3.4 Existe plano de emergência e procedimentos de resposta a vazamentos?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } }
                ],
                sub_areas: []
            },
            {
                id: "area_apoio",
                name: "4. INSTALAÇÕES DE APOIO",
                type: "Padrão",
                items: [
                    { id: "banheiros_vestiarios", name: "4.1 Os banheiros e vestiários estão limpos, ventilados e em boas condições físicas?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "sinalizacao_higiene", name: "4.2 Há sinalização adequada e condições de higiene nas áreas de uso coletivo?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "sala_treinamento", name: "4.3 A sala de treinamento possui iluminação e ventilação adequadas?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } }
                ],
                sub_areas: []
            },
            {
                id: "area_manutencao",
                name: "5. ÁREA DE MANUTENÇÃO E AMBIENTE EXTERNO",
                type: "Padrão",
                items: [
                    { id: "areas_organizadas", name: "5.1 As áreas de manutenção estão organizadas e livres de obstruções?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "inspecao_periodica", name: "5.2 Há inspeção periódica de ferramentas, equipamentos e EPIs?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "ambiente_externo", name: "5.3 O ambiente externo (pátio, estacionamento, drenagem) está limpo e sinalizado?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "riscos_ambientais", name: "5.4 Existem riscos ambientais (poeira, óleo, ruído, piso escorregadio) identificados?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "procedimentos_conhecidos", name: "5.5 Os colaboradores conhecem e seguem os procedimentos de segurança no trabalho externo?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } }
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
