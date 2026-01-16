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
    name: "Inspeção no Ambiente de Trabalho ADM 5S | SSMA",
    subject: "Inspeção 5S",
    description: "Inspeção de ambiente de trabalho administrativo baseada na metodologia 5S - organização, limpeza e segurança",
    settings: settings,
    structure: {
        areas: [
            {
                id: "area_identificacao",
                name: "Identificação",
                type: "Padrão",
                items: [
                    { id: "unidade", name: "Unidade:", type: "Texto", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "area_inspecionada", name: "Área Inspecionada:", type: "Texto", config: { hint: "", options: [], selection_options: [] } },
                    { id: "data_inspecao", name: "Data de Inspeção:", type: "Data", config: { hint: "", options: [], selection_options: [] } },
                    { id: "responsavel_registro", name: "Responsável de Registro:", type: "Texto", config: { hint: "", options: [], selection_options: [] } }
                ],
                sub_areas: []
            },
            {
                id: "area_sinalizacao",
                name: "✅ 1. Sinalização e Comunicação de Riscos",
                type: "Padrão",
                items: [
                    { id: "placas_legiveis", name: "As placas de sinalização estão legíveis e em bom estado?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "sinalizacao_adequada", name: "Existe sinalização de segurança adequada nos setores?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "raio_abertura_portas", name: "O raio de abertura das portas está sinalizado?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "saidas_emergencia", name: "Saídas de emergência sinalizadas e suficientes para o abandono do local com rapidez?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "sinalizacoes_seguranca", name: "Existem sinalizações de segurança no setor (ex.: \"não fumar\", \"uso obrigatório de EPI\")?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "postos_sinalizados", name: "Os postos de trabalho estão sinalizados e existe definição de responsáveis?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "sugestao_sinalizacao", name: "Sugestão de Melhoria:", type: "Texto", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } }
                ],
                sub_areas: []
            },
            {
                id: "area_instalacoes",
                name: "✅ 2. Instalações Elétricas e Estruturais",
                type: "Padrão",
                items: [
                    { id: "fiacao_organizada", name: "A fiação elétrica está organizada e sem danos visíveis?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "quadros_eletricos", name: "Os quadros elétricos estão sinalizados e protegidos?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "coberturas_estruturas", name: "As coberturas e estruturas estão em bom estado e sem risco de eventos acidentais?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "condicoes_estruturais", name: "As condições estruturais do setor estão boas?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "sugestao_instalacoes", name: "Sugestão de Melhoria:", type: "Texto", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } }
                ],
                sub_areas: []
            },
            {
                id: "area_limpeza",
                name: "✅ 3. Organização, Limpeza e Manutenção",
                type: "Padrão",
                items: [
                    { id: "piso_condicoes", name: "O piso está em boas condições e sem riscos de quedas?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "piso_limpo", name: "O piso está limpo?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "cuidados_manutencao", name: "Cuidados de manutenção (limpeza, arrumação, etc.) estão em bom nível?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "maquinas_limpas", name: "As máquinas e os equipamentos estão limpos?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "armarios_limpos", name: "Os armários são mantidos limpos?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "objetos_desorganizados", name: "Há objetos soltos ou materiais desorganizados nos postos de trabalho?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "pastas_identificadas", name: "Todas as pastas estão identificadas?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } }
                ],
                sub_areas: []
            },
            {
                id: "area_armazenamento",
                name: "✅ 4. Armazenamento e Identificação",
                type: "Padrão",
                items: [
                    { id: "armazenamento_seguro", name: "O armazenamento de produtos segue padrões de segurança e organização?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "materiais_armazenados", name: "Os materiais estão armazenados corretamente?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "recipientes_identificacao", name: "Os recipientes e tanques possuem identificação de risco?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "sugestao_armazenamento", name: "Sugestão de Melhoria:", type: "Texto", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } }
                ],
                sub_areas: []
            },
            {
                id: "area_ergonomia",
                name: "✅ 5. Condições de Trabalho e Ergonomia",
                type: "Padrão",
                items: [
                    { id: "espaco_movimentacao", name: "O espaço de trabalho permite movimentação segura?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "cadeiras_ajustaveis", name: "Os trabalhadores possuem cadeiras e mesas ajustáveis adequadas?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "iluminacao_adequada", name: "A iluminação é suficiente e adequada para cada setor?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "ventilacao_adequada", name: "Há ventilação adequada nas áreas?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } }
                ],
                sub_areas: []
            },
            {
                id: "area_procedimentos",
                name: "✅ 6. Inspeções e Procedimentos",
                type: "Padrão",
                items: [
                    { id: "equipamentos_inspecionados", name: "Os equipamentos de iluminação e ventilação são inspecionados regularmente?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "procedimento_evacuacao", name: "Há procedimento escrito e divulgado para evacuação segura de todo o pessoal, interno e externo, em caso de emergência?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "mapa_risco_acessivel", name: "O mapa de risco está acessível para todos os funcionários?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "riscos_identificados", name: "Os riscos específicos de cada área estão corretamente identificados?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "lixeiras_suficientes", name: "Há lixeiras suficientes e coleta regular de resíduos?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } }
                ],
                sub_areas: []
            },
            {
                id: "area_cultura",
                name: "✅ 7. Segurança de Pessoas e Cultura Organizacional (5S)",
                type: "Padrão",
                items: [
                    { id: "identificar_nao_autorizados", name: "Os funcionários sabem como identificar pessoas não autorizadas?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "visitantes_acompanhados", name: "Os visitantes são acompanhados por pessoal autorizado?", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } },
                    { id: "conhecem_5s", name: "Os empregados conhecem os 5 Sensos do Programa? E seus benefícios? (entrevistar empregados do posto)", type: "Avaliativo", config: { hint: "", options: [], selection_options: [], allow_photo: true, allow_attachment: true } }
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
