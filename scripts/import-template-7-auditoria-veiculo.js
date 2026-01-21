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

// Helper para criar config com foto
const withPhoto = (hint = "") => ({ hint, options: [], selection_options: [], allow_photo: true, allow_attachment: true });
const noPhoto = (hint = "") => ({ hint, options: [], selection_options: [] });
const selectList = (options, hint = "") => ({ hint, options, selection_type: "single", selection_options: options });
const selectListPhoto = (options, hint = "") => ({ hint, options, selection_type: "single", selection_options: options, allow_photo: true, allow_attachment: true });

const template = {
    id: generateId(),
    name: "Auditoria de Veículo | SSMA",
    subject: "Auditoria de Veículo",
    description: "Auditoria completa de veículo SSMA - documentação, equipamentos, condições estruturais, verificações operacionais e proteções",
    settings: settings,
    structure: {
        areas: [
            {
                id: "area_documentacao",
                name: "Documentação e Identificação",
                type: "Padrão",
                items: [
                    { id: "unidade", name: "Unidade", type: "Lista de Seleção", config: selectList(["São Luís", "Teresina"]) },
                    { id: "operacao", name: "Operação", type: "Lista de Seleção", config: selectList(["Programação", "Programação THE", "BPF", "QAV", "Transferência"]) },
                    { id: "tipo_veiculo", name: "Selecione o tipo de veículo", type: "Lista de Seleção", config: selectList(["Truck", "Bitruck", "Rodotrem", "Bitrem", "Carreta"]) },
                    { id: "placa_automovel", name: "Placa Automóvel", type: "Cadastro", config: noPhoto() },
                    { id: "placa_carreta_1", name: "Placa da Carreta I", type: "Cadastro", config: noPhoto() },
                    { id: "placa_carreta_2", name: "Placa da Carreta II", type: "Cadastro", config: noPhoto() },
                    { id: "documentos_dia", name: "Todos os documentos necessários para realização do transporte estão em dia, sem que nenhum deles esteja vencido?", type: "Avaliativo", config: withPhoto() },
                    { id: "cracha", name: "Crachá de identificação", type: "Avaliativo", config: withPhoto() },
                    { id: "certificado_fumaca", name: "Possui o certificado/Laudo de Emissão de Fumaça Negra (veículos movidos a óleo diesel), emitido por empresa especializada? (somente contratos PDL-T)", type: "Avaliativo", config: withPhoto() }
                ],
                sub_areas: []
            },
            {
                id: "area_equipamentos",
                name: "Equipamentos Fixos e de Segurança",
                type: "Padrão",
                items: [
                    { id: "extintor_cabine", name: "Unidade de Extintor Cabine 2A-20BC (2kg ou 4kg)", type: "Lista de Seleção", config: selectListPhoto(["Conforme", "Despressurizado", "Próximo do Vencimento", "Vencido", "Lacre Danificado", "Falha de Acessibilidade"]) },
                    { id: "kit_emergencia", name: "Kit de emergência para pequenos vazamentos?", type: "Avaliativo", config: withPhoto() },
                    { id: "jogo_ferramentas", name: "Jogo de ferramentas", type: "Avaliativo", config: withPhoto() },
                    { id: "triangulo", name: "Triângulo de emergência", type: "Avaliativo", config: withPhoto() },
                    { id: "extintor_carreta", name: "Unidades de Extintor 4A-30BC (8kg ou 12kg)", type: "Lista de Seleção", config: selectListPhoto(["Conforme", "Despressurizado", "Próximo do Vencimento", "Vencido", "Lacre Danificado", "Danificado"]) },
                    { id: "cavaletes_branco", name: "02 Unidades de Cavaletes Branco | Perigo Não Fume", type: "Avaliativo", config: withPhoto() },
                    { id: "cavaletes_amarelo", name: "04 Unidades de Cavaletes Amarelos | Perigo Afaste-se", type: "Avaliativo", config: withPhoto() },
                    { id: "cones_sinalizacao", name: "04 Unidades de Cones Laranja com 2 Faixas Reflexivas Brancas com Sapatas Para Sialização da Via?", type: "Avaliativo", config: withPhoto() },
                    { id: "cones_isolamento", name: "06 Unidades de Cones Laranja Pequenos com 2 Faixas Reflexivas Brancas", type: "Avaliativo", config: withPhoto() },
                    { id: "calcos_truck", name: "02 Unidades de Calços para Truck ou Carreta", type: "Avaliativo", config: withPhoto() },
                    { id: "calcos_bitrem", name: "06 Unidades de Calços para Bitrem ou Rodotrem", type: "Avaliativo", config: withPhoto() },
                    { id: "chave_geral", name: "Chave Geral", type: "Avaliativo", config: withPhoto() },
                    { id: "chave_geral_blindada", name: "Chave Geral Blindada", type: "Avaliativo", config: withPhoto() },
                    { id: "lona_abafadora", name: "Lona abafadora", type: "Avaliativo", config: withPhoto() },
                    { id: "cabo_terra", name: "Cabo-terra", type: "Avaliativo", config: withPhoto() },
                    { id: "balde_aluminio", name: "Balde de Alumínio", type: "Avaliativo", config: withPhoto() },
                    { id: "descarga_selada", name: "Descarga selada", type: "Avaliativo", config: withPhoto() },
                    { id: "pino_aterramento", name: "Pino de aterramento", type: "Avaliativo", config: withPhoto() },
                    { id: "valvula_fechamento", name: "Válvula de fechamento rápido", type: "Avaliativo", config: withPhoto() },
                    { id: "painel_risco", name: "Painel de risco", type: "Avaliativo", config: withPhoto() },
                    { id: "furo_tampa", name: "Em veículos com bomba para descarga, possui um furo na tampa da tubulação de saída ou sistema de alívio de pressão?", type: "Avaliativo", config: withPhoto() }
                ],
                sub_areas: []
            },
            {
                id: "area_condicoes",
                name: "Condições Visuais e Estruturais",
                type: "Padrão",
                items: [
                    { id: "alcas_mao", name: "Alças de mão de acesso à cabine", type: "Avaliativo", config: withPhoto() },
                    { id: "espelhos", name: "Espelhos retrovisores sem trincas ou quebras", type: "Avaliativo", config: withPhoto() },
                    { id: "cameras", name: "Possui sistema de câmeras (ao menos 04 câmeras instaladas: 01 frontal, 01 cabine, 01 lateral esquerda e 01 lateral direita? (somente contratos PDL-T)", type: "Avaliativo", config: withPhoto() },
                    { id: "sensores_ponto_cego", name: "Possui sensores de ponto cego (na frente e na lateral direta do cavalo, totalizando 4 pontos)? (somente contratos PDL-T, sendo que apenas poderão ser incorporados nas operações os veículos que possuam os sensores instalados, sendo aplicável para veículos entrantes na operação a partir de 2022. Demais veículos, marcar N/A) - Apenas para veículos outbound/entrega", type: "Avaliativo", config: withPhoto() },
                    { id: "climatizador", name: "Sistema climatizador de cabine", type: "Avaliativo", config: withPhoto() },
                    { id: "cinto_seguranca", name: "Cinto de segurança (cabine)", type: "Avaliativo", config: withPhoto() },
                    { id: "faixa_refletiva", name: "Faixa refletiva (laterais e traseira)", type: "Avaliativo", config: withPhoto() },
                    { id: "sistema_pneumatico", name: "Sistema pneumático protegido", type: "Avaliativo", config: withPhoto() },
                    { id: "tanques_vazamento", name: "Tanques sem vazamentos aparentes", type: "Avaliativo", config: withPhoto() },
                    { id: "valvulas_vazamento", name: "Válvulas do tanque sem vazamentos", type: "Avaliativo", config: withPhoto() },
                    { id: "pneus_estado", name: "Pneus em bom estado (sem bolhas, cortes ou desgaste irregular)", type: "Avaliativo", config: withPhoto() },
                    { id: "pneus_recape", name: "Os pneus no eixo direcional estão sem recape?", type: "Avaliativo", config: withPhoto() },
                    { id: "limpeza_externa", name: "Veículo com bom aspecto de limpeza externa", type: "Avaliativo", config: withPhoto() },
                    { id: "conservacao", name: "Veículo em bom estado de conservação (estrutura, pintura, lataria)", type: "Avaliativo", config: withPhoto() },
                    { id: "escada", name: "Escada antiderrapante", type: "Avaliativo", config: withPhoto() },
                    { id: "freio_abs", name: "Possui sistema de freio ABS (obrigatório para fabricados a partir de 2012) ou com funcionalidades similares?", type: "Avaliativo", config: withPhoto() },
                    { id: "freio_ebs", name: "Possui sistema de freio EBS (obrigatório para fabricados a partir de 2022)? Aplicável para veículos entrantes na operação em 2022. Demais veículos, marcar N/A.", type: "Avaliativo", config: withPhoto() },
                    { id: "nivel_oleo", name: "Conferência do nível de óleo do motor", type: "Avaliativo", config: withPhoto() },
                    { id: "capacidade_demarcada", name: "A capacidade dos compartimentos está demarcada na escotilha de enchimento e no bocal de descarga?", type: "Avaliativo", config: withPhoto() },
                    { id: "parabrisa", name: "O para-brisas está em bom estado (sem trincas)? É proibida a utilização de adesivos e letreiros em LED no para brisas com mensagens.", type: "Avaliativo", config: withPhoto() },
                    { id: "limpadores", name: "Os limpadores de para-brisas e esguichos de água estão em funcionamento e em bom estado?", type: "Avaliativo", config: withPhoto() },
                    { id: "bateria_protegida", name: "A bateria está protegida?", type: "Avaliativo", config: withPhoto() },
                    { id: "linhas_conectores", name: "As linhas e conectores não apresentam ligações adicionais acopladas ao sistema de freios a ar, mangueiras fora da especificação ou conexões irregulares ou defeituosas nos chicotes elétricos?", type: "Avaliativo", config: withPhoto() },
                    { id: "caixa_acessorios", name: "Possui caixa de acessórios fixada à estrutura do chassi com trava e ferramentas (conforme legislação)?", type: "Avaliativo", config: withPhoto() },
                    { id: "ligacao_tanque", name: "Possui ligação tanque e chassis (continuidade elétrica)?", type: "Avaliativo", config: withPhoto() },
                    { id: "valvula_fundo", name: "Possui válvula de fundo funcionando?", type: "Avaliativo", config: withPhoto() },
                    { id: "alivio_pressao", name: "Possui dispositivo para alívio de pressão e vácuo?", type: "Avaliativo", config: withPhoto() },
                    { id: "protetor_rodas", name: "Protetor de rodas traseiras (para-lamas)", type: "Avaliativo", config: withPhoto() },
                    { id: "identificadores_produto", name: "As bocas possuem identificadores de produto em cada saída de compartimento? (somente contratos PDL-T)", type: "Avaliativo", config: withPhoto() },
                    { id: "sistema_fadiga", name: "Possui sistema de fadiga (01 câmeras voltada para o rosto do motorista)? (somente contratos PDL-T - Outbound)", type: "Avaliativo", config: withPhoto() }
                ],
                sub_areas: []
            },
            {
                id: "area_verificacoes",
                name: "Verificações Operacionais",
                type: "Padrão",
                items: [
                    { id: "iluminacao_frontal", name: "Iluminação frontal (faróis)", type: "Avaliativo", config: withPhoto() },
                    { id: "iluminacao_lateral", name: "Iluminação lateral", type: "Avaliativo", config: withPhoto() },
                    { id: "iluminacao_traseira", name: "Iluminação traseira", type: "Avaliativo", config: withPhoto() },
                    { id: "iluminacao_placa", name: "Iluminação da placa traseira", type: "Avaliativo", config: withPhoto() },
                    { id: "luzes_seta", name: "Iluminação do painel veicular (Luzes de seta)", type: "Avaliativo", config: withPhoto() },
                    { id: "setas_soldadas", name: "As setas dos compartimentos estão soldadas ou lacradas?", type: "Avaliativo", config: withPhoto() },
                    { id: "cronotacografo", name: "Possui cronotacógrafo? Está válido e ligado diretamente à bateria?", type: "Avaliativo", config: withPhoto() },
                    { id: "alarme_seta", name: "Possui alarme de seta no cavalo e carreta? (somente contratos PDL-T)", type: "Avaliativo", config: withPhoto() },
                    { id: "alarme_re", name: "Possui alarme de ré?", type: "Avaliativo", config: withPhoto() }
                ],
                sub_areas: []
            },
            {
                id: "area_protecoes",
                name: "Proteções",
                type: "Padrão",
                items: [
                    { id: "protecao_queda", name: "Possui proteção anti-queda para quem subir no CT com acionamento manual ou pneumático com dispositivo de travamento? (obrigatório para operação outbound)", type: "Avaliativo", config: withPhoto() },
                    { id: "protecao_grampos", name: "Possui proteção de grampos do eixo suspensor?", type: "Avaliativo", config: withPhoto() },
                    { id: "protecao_ciclista", name: "Possui proteção traseira e lateral (proteção de ciclista)? (obrigatório para veículos fabricados a partir de 2011)", type: "Avaliativo", config: withPhoto() },
                    { id: "protecao_bocas", name: "Possui proteção das bocas do tanque e entorno (Santo Antônio)? (obrigatório para veículos fabricados a partir de 2011)", type: "Avaliativo", config: withPhoto() },
                    { id: "protecao_tombamento", name: "Possui proteção de anti-tombamento?", type: "Avaliativo", config: withPhoto() },
                    { id: "parachoque", name: "Possui para-choque traseiro com faixas oblíquas a 45º (50mm) e altura da borda inferior máxima de 45cm do solo?", type: "Avaliativo", config: withPhoto() },
                    { id: "sensor_distancia", name: "Possui sensor de distância? (01 câmeras frontal voltada para a via)? (somente contratos PDL-T)", type: "Avaliativo", config: withPhoto() }
                ],
                sub_areas: []
            }
        ]
    },
    target_vehicle_types: [],
    assigned_user_ids: []
};

console.log('🚀 Criando template:', template.name);
console.log('📁 Áreas:', template.structure.areas.length);
console.log('📋 Itens:', template.structure.areas.reduce((sum, a) => sum + a.items.length, 0), '\n');

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
            console.log('✅ SUCESSO! Template criado!');
            console.log('🆔 ID:', result[0].id);
            console.log('📅 Criado em:', result[0].created_at);
        } else {
            console.error('❌ ERRO:', res.statusCode);
            console.error('📄 Detalhes:', data);
        }
    });
});

req.on('error', (error) => console.error('❌ Erro na requisição:', error.message));
req.write(JSON.stringify(template));
req.end();
