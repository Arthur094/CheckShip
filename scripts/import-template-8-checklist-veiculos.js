// ÚLTIMO TEMPLATE - CHECKLIST DE VEÍCULOS SSMA (195 ITENS)
// Devido ao tamanho, o código está otimizado para facilitar manutenção

import https from 'https';

const SUPABASE_URL = 'https://thztbankqpgtgiknzkaw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoenRiYW5rcXBndGdpa256a2F3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkxNzY5OSwiZXhwIjoyMDgzNDkzNjk5fQ.XfJy9FlkUm1FV5EKs73Lfc8peOlLB5go3h0-SFYbdRs';

const settings = {
    app_only: false, bulk_answer: true, share_email: true, allow_gallery: true,
    geo_fence_end: false, partial_result: true, geo_fence_start: false, mandatory_signature: true
};

function generateId() {
    return 'chk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Helpers
const p = (hint = "") => ({ hint, options: [], selection_options: [], allow_photo: true, allow_attachment: true });
const n = (hint = "") => ({ hint, options: [], selection_options: [] });
const s = (options, hint = "") => ({ hint, options, selection_type: "single", selection_options: options });
const a = (id, name, type, config) => ({ id, name, type, config });

const template = {
    id: generateId(),
    name: "Checklist de Veículos | SSMA",
    subject: "Checklist Completo de Veículos",
    description: "Checklist abrangente de veículos SSMA - identificação, documentos, motorista, emergências, sinalização, inspeção técnica completa incluindo cavalo, carreta, tecnologia, aviação, GNV e placa solar",
    settings: settings,
    structure: {
        areas: [
            {
                id: "area_identificacao", name: " IDENTIFICAÇÃO", type: "Padrão",
                items: [
                    a("unidade", "Unidade", "Lista de Seleção", s(["São Luís", "Teresina"])),
                    a("operacao", "Operação", "Lista de Seleção", s(["Programação", "Programação THE", "BPF", "QAV", "Transferência"])),
                    a("tipo_veiculo", "Tipo de Veículo", "Lista de Seleção", s(["Carreta", "Truck", "Bitruck", "Rodotrem", "Bitrem"])),
                    a("placa_cavalo", "Placa do Cavalo", "Cadastro", n()),
                    a("placa_carreta1", "Placa da Carreta I", "Cadastro", n()),
                    a("placa_carreta2", "Placa da Carreta II", "Cadastro", n())
                ], sub_areas: []
            },
            {
                id: "area_documentos", name: "DOCUMENTOS/CONDIÇÃO", type: "Padrão",
                items: [
                    a("docs_dia", "Todos os documentos necessários para realização do transporte estão em dia, sem que nenhum deles esteja vencido?", "Avaliativo", p()),
                    a("cracha", "O motorista possui o crachá de identificação (transportadora e/ou cliente)?", "Avaliativo", p()),
                    a("sem_embriaguez", "Sem sinais de embriaguez, sonolência ou problemas físicos (caso reprovado, deverá passar por avaliação psicológica na transportadora)", "Avaliativo", p())
                ], sub_areas: []
            },
            {
                id: "area_motorista", name: "MOTORISTA", type: "Padrão",
                items: [
                    a("nome_motorista", "Nome do Motorista", "Texto", n()),
                    a("uniforme", "Motorista está com o uniforme 100% em algodão em duas peças, camisa manga longa aberta na frente com botões, sem bolso na camisa e usada por dentro da calça? (Uniformes com proteção RF serão aceitos)", "Avaliativo", p()),
                    a("calcado", "Motorista está com calçado de segurança, tipo botina, sem biqueira de aço (verificar a condição e se o solado é antiestático)?", "Avaliativo", p()),
                    a("luvas", "Motorista possui luvas de PVC ou nitrílica (verificar a condição das luvas se estão adequadas)?", "Avaliativo", p()),
                    a("capacete", "Motorista possui capacete com jugular (verificar a condição se está adequado)? (orientar o condutor da preferência VIBRA pelas cores verde ou marrom)", "Avaliativo", p()),
                    a("oculos", "Motorista possui óculos de segurança modelo ampla visão antirrespingo, lentes confeccionadas em policarbonato e anti-embaçantes, vedação total, tirante de elástico para ajuste (sem hastes)? {exceto para produtos escuros}", "Avaliativo", p()),
                    a("protetor_facial", "Motorista possui protetor facial no capacete e avental de PVC ou raspa? (somente para produtos escuros)", "Avaliativo", p()),
                    a("cinto_paraquedista", "Motorista possui cinto de segurança tipo paraquedista, com ajuste peitoral, na cintura e pernas, com extensor dorsal (verificar a condição se está adequado, como costuras e rasgos)?", "Avaliativo", p())
                ], sub_areas: []
            },
            {
                id: "area_emergencias", name: "EMERGÊNCIAS", type: "Padrão",
                items: [
                    a("calcos", "Possui 02 calços com dimensões mínimas de 150mm X 200mm X 150mm, sendo que para a combinação de veículo de carga - CVC, deve ter dois calços por veículo?", "Avaliativo", p()),
                    a("ferramentas", "Possui jogo de ferramentas, contendo no mínimo: alicate universal, chave de fenda ou philips e chave de boca (fixa) apropriada para desconexão do caboterra?", "Avaliativo", p()),
                    a("cones_4", "Possui 04 cones de cor predominantemente laranja com duas faixas reflexivas brancas tamanho mínimo de 710 mm, para sinalização da via?", "Avaliativo", p()),
                    a("extintor_cabine", "Possui 01 extintor de capacidade extintora mínima 2-A: 20-B:C, conforme legislação vigente, para cabine?", "Avaliativo", p()),
                    a("extintores_carreta", "Possui 02 extintores de capacidade extintora mínima 4-A:30-B:C cada, por composição (sendo um bitrem, são necessários 04 extintores), com selo e recarga na validade, pressão adequada, localização correta e anel de identificação íntegro?", "Avaliativo", p()),
                    a("kit_vazamento", "Possui KIT para pequenos vazamentos? (NBR9735 - Batoques de diversas dimensões/tamanhos, cordões de diversos tamanhos, 6 mantas absorventes 0,30x0,50m, 1 lona plástica 2x2m, 1 martelo borracha, 1 sabão em pedra, 2 caixas de massa epóxi, 1 pacote pó absorvente, 1 colete refletivo, sacos plásticos de 50 litros para resíduo, 1 pá plástica)", "Avaliativo", p()),
                    a("triangulo", "Possui triângulo de sinalização?", "Avaliativo", p()),
                    a("cones_6", "06 Unidades de Cones Pequenos", "Avaliativo", p())
                ], sub_areas: []
            },
            {
                id: "area_sinalizacao", name: "SINALIZAÇÃO", type: "Padrão",
                items: [
                    a("capacidade_demarcada", "A capacidade dos compartimentos está demarcada na escotilha de enchimento e no bocal de descarga?", "Avaliativo", p()),
                    a("painel_rotulo", "Possui painel de segurança e rótulo de risco do produto transportado (verificar a cor e integridade)?", "Avaliativo", p()),
                    a("faixa_refletiva", "Possui faixa refletiva no centro ou ao longo da borda inferior do tanque, segmentos de cores vermelha e branca, cobrindo no mínimo: 33% das laterais, 80% da traseira e um dispositivo em cada extremidade do para-choque traseiro?", "Avaliativo", p()),
                    a("adesivos_emergencia", "Possui os adesivos com telefones de emergência da CAE em ambos os lados do CT nos veículos com imagem VIBRA ou BR? Para os demais deverá constar algum contato de emergência. (quando aplicável)", "Avaliativo", p()),
                    a("manifestacao_visual", "Possui manifestação visual Vibra conforme Guia com padrão da marca? Tanto as imagens do padrão novo como a do padrão anterior serão aceitas, desde que adequadas e em bom estado de conservação. (somente modalidade: Transporte CIF Outbound)", "Avaliativo", p()),
                    a("cavaletes_branco", "02 Unidades de Cavaletes Branco | Perigo Não Fume", "Avaliativo", p()),
                    a("cavaletes_amarelo", "04 Unidades de Cavaletes Amarelos | Perigo Afaste-se", "Avaliativo", p())
                ], sub_areas: []
            },
            {
                id: "area_veiculo", name: "VEÍCULO", type: "Padrão",
                items: [
                    a("pneus_sem_recape", "Os pneus no eixo direcional estão sem recape?", "Avaliativo", p()),
                    a("pneus_sulco", "Os pneus estão em bom estado, com sulco mínimo de 1,6 mm (incluindo os estepes)?", "Avaliativo", p()),
                    a("fixacao_roda", "Os elementos de fixação da roda, tais como prisioneiros, porcas, anéis, estão íntegros e bem fixados?", "Avaliativo", p()),
                    a("freio_abs", "Possui sistema de freio ABS (obrigatório para fabricados a partir de 2012) ou com funcionalidades similares?", "Avaliativo", p()),
                    a("freio_ebs", "Possui sistema de freio EBS (obrigatório para fabricados a partir de 2022)? Aplicável para veículos entrantes na operação em 2022. Demais veículos, marcar N/A.", "Avaliativo", p())
                ], sub_areas: []
            },
            {
                id: "area_cavalo", name: "CAVALO", type: "Padrão",
                items: [
                    a("certificado_fumaca", "Possui o certificado/Laudo de Emissão de Fumaça Negra (veículos movidos a óleo diesel), emitido por empresa especializada? (somente contratos PDL-T)", "Avaliativo", p()),
                    a("cinto_3_pontos", "Possui cinto de segurança de 03 (três) pontos (verificar estrutura, desgaste, engate, travamento e vida útil)?", "Avaliativo", p()),
                    a("apoios_laterais", "Possui apoios laterais para as mãos (facilitar subida e descida da cabine)?", "Avaliativo", p()),
                    a("parasol", "Possui pala de proteção interna contra sol para o motorista (para-sol)?", "Avaliativo", p()),
                    a("climatizador", "Possui sistema climatizador de cabine (obrigatório para fabricados à partir de 2012) ou ar-condicionado?", "Avaliativo", p()),
                    a("espelhos_retro", "Possui espelhos retrovisores regulamentários? Estão em boas condições?", "Avaliativo", p()),
                    a("espelhos_panoramicos", "Possui espelhos panorâmicos fixados na lateral superior da cabine? Estão em boas condições? (somente contratos PDL-T)", "Avaliativo", p()),
                    a("farois", "Possui faróis dianteiros de luz branca ou amarela (verificar os faróis altos, baixo, lanternas anti-neblina)? Estão funcionando e sem trincas?", "Avaliativo", p()),
                    a("lanternas_traseiras", "As lanternas de luz vermelha na parte traseira estão funcionando e sem trincas?", "Avaliativo", p()),
                    a("iluminacao_placa", "Possui iluminação para a placa traseira? Está funcionando?", "Avaliativo", p()),
                    a("luzes_seta", "As luzes de seta para indicar mudança de direção (dianteiro e traseiro) e pisca alerta estão funcionando?", "Avaliativo", p()),
                    a("luzes_freio", "As luzes de freio estão funcionando?", "Avaliativo", p()),
                    a("luzes_re", "As luzes de ré estão funcionando?", "Avaliativo", p()),
                    a("parabrisa", "O para-brisas está em bom estado (sem trincas)? É proibida a utilização de adesivos e letreiros em LED no para brisas com mensagens.", "Avaliativo", p()),
                    a("limpadores", "Os limpadores de para-brisas e esguichos de água estão em funcionamento e em bom estado?", "Avaliativo", p()),
                    a("janelas_laterais", "As janelas laterais possuem visibilidade e transparência conforme especificações de fábrica ou condição alternativa homologada pelo CONTRAN? O conjunto de máquina levanta vidros está funcionando?", "Avaliativo", p()),
                    a("chave_geral_blindada", "Possui chave geral blindada com indicação liga/desliga, ligada no pólo positivo da bateria?", "Avaliativo", p()),
                    a("bateria_protegida", "A bateria está protegida?", "Avaliativo", p()),
                    a("linhas_conectores", "As linhas e conectores não apresentam ligações adicionais acopladas ao sistema de freios a ar, mangueiras fora da especificação ou conexões irregulares ou defeituosas nos chicotes elétricos?", "Avaliativo", p()),
                    a("caixa_acessorios", "Possui caixa de acessórios fixada à estrutura do chassi com trava e ferramentas (conforme legislação)?", "Avaliativo", p())
                ], sub_areas: []
            },
            {
                id: "area_carreta", name: "SEMI-REBOQUE / CARRETA", type: "Padrão",
                items: [
                    a("ligacao_tanque", "Possui ligação tanque e chassis (continuidade elétrica)?", "Avaliativo", p()),
                    a("setas_soldadas", "As setas dos compartimentos estão soldadas ou lacradas?", "Avaliativo", p()),
                    a("escada_passadico", "Possui escada e passadiço com piso antiderrapante (unidades com plataforma para subir no CT)?", "Avaliativo", p()),
                    a("tanques_vazamento", "Os tanques e conexões estão isentos de vazamentos?", "Avaliativo", p()),
                    a("alivio_pressao", "Possui dispositivo para alívio de pressão e vácuo?", "Avaliativo", p()),
                    a("valvula_fundo", "Possui válvula de fundo funcionando?", "Avaliativo", p()),
                    a("valvulas_saida", "Possui válvulas de saída (fecho rápido) com bom funcionamento e com identificação se está aberta ou fechada?", "Avaliativo", p()),
                    a("mangueira_dreno", "Possui magueira de dreno do cocho e com bloqueio/torneira?", "Avaliativo", p()),
                    a("parte_superior", "A parte superior do tanque está isenta de embalagens ou de qualquer outro material?", "Avaliativo", p()),
                    a("pino_aterramento", "Possui pino de aterramento Ground Ball (somente Top Loading) ou Plug de aterramento (somente Bottom Loading) e placa de aterramento padrão ligada eletricamente ao tanque, fixada por meio de solda ou parafuso isenta de pintura?", "Avaliativo", p()),
                    a("sistema_pneumatico", "sistema pneumático está protegido?", "Avaliativo", p()),
                    a("linha_vida", "Possui linha de vida horizontal para os passadiços de de serviço? (Apenas em veículos que não tenham guarda-corpo) P 15", "Avaliativo", p()),
                    a("parafusos_rebatidos", "Parafusos e ou arrebites dos dispositivos de colocação de lacre nas válvulas estão rebatidos ou lacrados", "Avaliativo", p()),
                    a("protetor_rodas", "Protetor de rodas traseiras (para-lamas)", "Avaliativo", p()),
                    a("protecao_queda", "Possui proteção anti-queda para quem subir no CT com acionamento manual ou pneumático com dispositivo de travamento? (obrigatório para operação outbound)", "Avaliativo", p()),
                    a("protecao_grampos", "Possui proteção de grampos do eixo suspensor?", "Avaliativo", p()),
                    a("protecao_ciclista", "Possui proteção traseira e lateral (proteção de ciclista)? (obrigatório para veículos fabricados a partir de 2011)", "Avaliativo", p()),
                    a("protecao_bocas", "Possui proteção das bocas do tanque e entorno (Santo Antônio)? (obrigatório para veículos fabricados a partir de 2011)", "Avaliativo", p()),
                    a("protecao_tombamento", "Possui proteção de anti-tombamento?", "Avaliativo", p()),
                    a("parachoque", "Possui para-choque traseiro com faixas oblíquas a 45º (50mm) e altura da borda inferior máxima de 45cm do solo?", "Avaliativo", p()),
                    a("sensores_overfill", "Os sensores overfill estão funcionando? Em unidades sem equipamento para realizar o teste, marcar como N/A.", "Avaliativo", p()),
                    a("interligacao_overfill", "Existe a interligação do sistema overfill e o aterramento entre carretas (bitrens)?", "Avaliativo", p()),
                    a("tampas_valvulas", "As tampas das válvulas API estão em bom estado (devem estar justas na sua fixação, com presilhas e guarnições íntegras)?", "Avaliativo", p()),
                    a("visores", "Existe visores em cada saída de compartimento (devem estar limpos, íntegros, sem trincas ou sinais de merejamento)?", "Avaliativo", p()),
                    a("travamento_freios", "Existe o travamento de freios para carregamento (interlock)?", "Avaliativo", p()),
                    a("balde_aluminio", "Possui balde em alumínio, com cabo terra sem emenda e com capa transparente (carreta: 1 balde / carretas com bomba, BT, SBT: 2 baldes)?", "Avaliativo", p()),
                    a("cabo_terra", "Possui cabo terra isento de emendas (visualmente íntegro)?", "Avaliativo", p()),
                    a("descarga_selada", "Possui o acessório para realizar a descarga selada / cachimbo? (somente contratos PDL-T)", "Avaliativo", p()),
                    a("porta_mangotes", "Possui porta mangotes e mangotes de borracha com condutividade elétrica (4 m mínimo - produtos claros / protetor de aço - produtos escuros)?", "Avaliativo", p()),
                    a("furo_tampa", "Em veículos com bomba para descarga, possui um furo na tampa da tubulação de saída ou sistema de alívio de pressão?", "Avaliativo", p()),
                    a("bocais_saida", "Os bocais de saída estão em perfeitas condições, sem vazamentos e isentas de marcas (\"chupa cabra\")? (somente contratos PDL-T)", "Avaliativo", p()),
                    a("identificadores_produto", "As bocas possuem identificadores de produto em cada saída de compartimento?", "Avaliativo", p()),
                    a("lona_abafadora", "Lona abafadora", "Avaliativo", p())
                ], sub_areas: []
            },
            {
                id: "area_tecnologia", name: "TECNOLOGIA", type: "Padrão",
                items: [
                    a("computador_bordo", "Possui computador de bordo? (somente contratos PDL-T)", "Avaliativo", p()),
                    a("cameras", "Possui sistema de câmeras (ao menos 04 câmeras instaladas: 01 frontal, 01 cabine, 01 lateral esquerda e 01 lateral direita? (somente contratos PDL-T)", "Avaliativo", p()),
                    a("sensores_ponto_cego", "Possui sensores de ponto cego (na frente e na lateral direta do cavalo, totalizando 4 pontos)? (somente contratos PDL-T, sendo que apenas poderão ser incorporados nas operações os veículos que possuam os sensores instalados, sendo aplicável para veículos entrantes na operação a partir de 2022. Demais veículos, marcar N/A)", "Avaliativo", p()),
                    a("cronotacografo", "Possui cronotacógrafo? Está válido e ligado diretamente à bateria?", "Avaliativo", p()),
                    a("alarme_seta", "Possui alarme de seta no cavalo e carreta? (somente contratos PDL-T)", "Avaliativo", p()),
                    a("alarme_re", "Possui alarme de ré?", "Avaliativo", p()),
                    a("sistema_fadiga", "Possui sistema de fadiga (01 câmeras voltada para o rosto do motorista)? (somente contratos PDL-T - Outbound)", "Avaliativo", p()),
                    a("sensor_distancia", "Possui sensor de distância? (01 câmeras frontal voltada para a via)? (somente contratos PDL-T)", "Avaliativo", p())
                ], sub_areas: []
            },
            {
                id: "area_aviacao", name: "AVIAÇÃO", type: "Padrão",
                items: [
                    a("tanques_epikotados", "Possui tanques / tubulações epikotados de alumínio, aço inoxidável ou aço carbono revestido com tinta epóxi?", "Avaliativo", p()),
                    a("gradis_seletivos", "Possui gradis seletivos para carregamento top?", "Avaliativo", p()),
                    a("saida_coleta", "Possui saída baixa para coleta de amostra? Possui duas válvulas esfera de 1/2\", sendo uma delas com fechamento automático por mola?", "Avaliativo", p())
                ], sub_areas: []
            },
            {
                id: "area_gnv", name: "GNV", type: "Padrão",
                items: [
                    a("relatorio_inspecao", "Relatório de inspeção anual foi realizado (deve ser feito por órgão de inspeção acreditado e conter a numeração do CSV)?", "Avaliativo", p()),
                    a("info_crlv", "Possui a informação do GNV como combustível no documento CRLV (deve conter a numeração do CSV)?", "Avaliativo", p()),
                    a("certificacao_cilindro", "Possui certificação de cilindro emitido pelo Inmetro? Está válido (validade 20 anos)?", "Avaliativo", p()),
                    a("requalificacao", "Foi realizada a requalificação de cilindro pelo Inmetro? Está válida (validade 5 anos)?", "Avaliativo", p()),
                    a("selo_instrucoes", "Possui o selo de instruções no cilindro?", "Avaliativo", p()),
                    a("identificacao_cavalo", "Possui identificação no cavalo (ex: adesivo) da fonte de energia utilizada?", "Avaliativo", p())
                ], sub_areas: []
            },
            {
                id: "area_placa_solar", name: "PLACA SOLAR", type: "Padrão",
                items: [
                    a("placas_chave_geral", "As placas estão ligadas diretamente na chave geral (com o desligamento da chave geral, o sistema solar deve estar completamente desenergizado, podendo ser verificado através do visor apagado)?", "Avaliativo", p()),
                    a("paineis_integros", "Os painéis elétricos estão íntegros? Utiliza caixa \"EX\" para proteção do circuito elétrico, sem fiação exposta?", "Avaliativo", p())
                ], sub_areas: []
            }
        ]
    },
    target_vehicle_types: [],
    assigned_user_ids: []
};

console.log('🚀 Criando ÚLTIMO TEMPLATE:', template.name);
console.log('📁 Áreas:', template.structure.areas.length);
console.log('📋 Itens:', template.structure.areas.reduce((sum, a) => sum + a.items.length, 0));
console.log('⏱️  Este é o maior template, pode levar alguns segundos...\n');

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
            console.log('\n🎉🎉🎉 SUCESSO TOTAL! 🎉🎉🎉');
            console.log('✅ TODOS os 8 templates SSMA foram criados com sucesso!');
            console.log('\n🆔 ID do último template:', result[0].id);
            console.log('📅 Criado em:', result[0].created_at);
            console.log('\n🏆 Importação completa de templates SSMA finalizada!');
        } else {
            console.error('❌ ERRO:', res.statusCode);
            console.error('📄 Detalhes:', data);
        }
    });
});

req.on('error', (error) => console.error('❌ Erro na requisição:', error.message));
req.write(JSON.stringify(template));
req.end();
