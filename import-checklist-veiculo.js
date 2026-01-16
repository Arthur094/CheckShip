import https from 'https';

// Configuracao Supabase
const SUPABASE_URL = 'https://thztbankqpgtgiknzkaw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoenRiYW5rcXBndGdpa256a2F3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkxNzY5OSwiZXhwIjoyMDgzNDkzNjk5fQ.XfJy9FlkUm1FV5EKs73Lfc8peOlLB5go3h0-SFYbdRs';

// Settings do template
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

// Structure do template
const structure = {
    areas: [
        {
            id: "area_informacoes",
            name: "Informações",
            type: "Padrão",
            items: [
                {
                    id: "unidade",
                    name: "Unidade:",
                    type: "Lista de Seleção",
                    config: {
                        hint: "",
                        options: ["São Luís", "Teresina"],
                        selection_type: "single",
                        selection_options: ["São Luís", "Teresina"]
                    }
                },
                {
                    id: "disponibilidade_veiculo",
                    name: "Disponibilidade de Veículo:",
                    type: "Lista de Seleção",
                    config: {
                        hint: 'Ao selecionar "Indisponibilidade de veículo", os demais campos da 3ª Etapa deverão ser preenchidos apenas para fins de conclusão do checklist, sem vinculação a nenhuma placa.',
                        options: ["Veículo disponível", "Indisponibilidade de veículo"],
                        selection_type: "single",
                        selection_options: ["Veículo disponível", "Indisponibilidade de veículo"],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "tipo_veiculo",
                    name: "Selecione o tipo de veículo",
                    type: "Lista de Seleção",
                    config: {
                        hint: "",
                        options: ["Truck", "Carreta", "Bitruck", "Bitrem", "Rodotrem"],
                        selection_type: "single",
                        selection_options: ["Truck", "Carreta", "Bitruck", "Bitrem", "Rodotrem"]
                    }
                },
                {
                    id: "placa_carreta_1",
                    name: "Placa da Carreta I",
                    type: "Texto",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "placa_carreta_2",
                    name: "Placa da Carreta II:",
                    type: "Cadastro",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "documentos_dia",
                    name: "Todos os documentos necessários para realização do transporte estão em dia, sem que nenhum deles esteja vencido?",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "documentos_vencidos",
                    name: "Selecione os documentos vencidos:",
                    type: "Lista de Seleção",
                    config: {
                        hint: "",
                        options: ["Certificado de Verificação Volumétrica", "CIPP", "CIV", "CRLV", "Licenças Ambientais", "Crachá", "CNH", "MOPP", "Teste de Opacidade"],
                        selection_type: "multiple",
                        selection_options: ["Certificado de Verificação Volumétrica", "CIPP", "CIV", "CRLV", "Licenças Ambientais", "Crachá", "CNH", "MOPP", "Teste de Opacidade"],
                        allow_photo: true,
                        allow_attachment: true
                    }
                }
            ],
            sub_areas: []
        },
        {
            id: "area_epis",
            name: "EPI's",
            type: "Padrão",
            items: [
                {
                    id: "epi_luvas",
                    name: "Luvas:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "epi_luva_reserva",
                    name: "Luva Reserva:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "epi_oculos",
                    name: "Óculos:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "epi_uniforme",
                    name: "Uniforme:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "epi_capacete",
                    name: "Capacete com Jugular (Aranha):",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "epi_cinto_paraquedista",
                    name: "Cinto Paraquedista:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "epi_calcado",
                    name: "Calçado de Segurança:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "epi_colete",
                    name: "Colete refletivo",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                }
            ],
            sub_areas: []
        },
        {
            id: "area_equipamentos",
            name: "Equipamentos",
            type: "Padrão",
            items: [
                {
                    id: "equip_calco",
                    name: "Unidades de Calço:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "equip_cavalete_amarelo",
                    name: "04 Unidades de Cavaletes Amarelos | Perigo Afaste-se:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "equip_cavalete_branco",
                    name: "02 Unidades de Cavaletes Branco | Prerigo Não Fume:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "equip_cones",
                    name: "04 Unidades de Cones com Faixas Reflexivas com Sapatas:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "equip_ferramentas",
                    name: "Jogo de Ferramentas:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "equip_cabo_terra",
                    name: "Cabo-terra:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "equip_triangulo",
                    name: "Trinângulo de Emergência:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "equip_balde",
                    name: "Balde de alumínio",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "equip_kit_emergencia",
                    name: "Kit emergencia",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                }
            ],
            sub_areas: []
        },
        {
            id: "area_acessorios",
            name: "ITENS ACESSÓRIOS E EMERGÊNCIAS",
            type: "Padrão",
            items: [
                {
                    id: "extintor_cabine",
                    name: "01 Unidade de Extintor - Cabine 2A | 20-BC (2kg ou 4kg):",
                    type: "Lista de Seleção",
                    config: {
                        hint: "",
                        options: ["Conforme", "Despressurizado", "Próximo do Vencimento", "Vencido", "Lacre Danificado", "Danificado"],
                        selection_type: "single",
                        selection_options: ["Conforme", "Despressurizado", "Próximo do Vencimento", "Vencido", "Lacre Danificado", "Danificado"]
                    }
                },
                {
                    id: "extintor_carreta",
                    name: "02 Unidades de Extintor - Carreta 4A | 30-BC (8kg ou 12kg):",
                    type: "Lista de Seleção",
                    config: {
                        hint: "",
                        options: ["Conforme", "Despressurizado", "Próximo do Vencimento", "Vencido", "Lacre Danificado", "Danificado"],
                        selection_type: "single",
                        selection_options: ["Conforme", "Despressurizado", "Próximo do Vencimento", "Vencido", "Lacre Danificado", "Danificado"]
                    }
                },
                {
                    id: "calcos_borracha",
                    name: "Calços de borracha",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "kit_emergencia_nbr",
                    name: "Kit de emergência (NBR 9735) e EPIs",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "telefones_emergencia",
                    name: "Marcação de telefones de emergência",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "placas_simbologia",
                    name: "Placas de Simbologia e Suporte",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "chave_roda_macaco",
                    name: "Chave de Roda, macaco e triângulo",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "cones_sinalizacao",
                    name: "04 Cones de sinalização",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "cones_isolamento",
                    name: "06 Cones de isolamento",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                }
            ],
            sub_areas: []
        },
        {
            id: "area_veiculo",
            name: "Veículo",
            type: "Padrão",
            items: [
                {
                    id: "veiculo_limpeza",
                    name: "Veículo com bom aspecto de limpeza?",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "veiculo_conservacao",
                    name: "Veículo em bom estado de conservação?",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "pino_aterramento",
                    name: "Pino de Aterramento:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "pneus_estado",
                    name: "Pneus em bom estado para uso?",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "espelhos_retrovisores",
                    name: "Os Espelhos Retrovisores estão em bom estado de uso, sem que apresentem trincas ou quebras?",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "tanques_funcionamento",
                    name: "Os Tanques estão em bom funcionamento sem que apresentem vazamentos?",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "valvulas_tanque",
                    name: "As válvulas do Tanque estão em bom estado de conservação sem que apresentem vazamentos?",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "chave_geral",
                    name: "Chave Geral:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "cintos_seguranca",
                    name: "Cintos de Segurança:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "freio",
                    name: "Freio:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "alcas_mao",
                    name: "Alças de Mão de Acesso à Cabine:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "climatizador",
                    name: "Sistema Climatizador de Cabine:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "cameras",
                    name: "Câmeras em Posicionamento:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "nivel_oleo",
                    name: "Conferência do Nível de Óleo do Motor:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "painel_risco",
                    name: "Painel de Risco:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "faixa_refletiva",
                    name: "Faixa Refletiva:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "chave_geral_blindada",
                    name: "Chave Geral Blindada:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "sistema_pneumatico",
                    name: "Sistema Pneumático Protegido:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "valvula_fechamento",
                    name: "Válvula de Fechamento Rápido:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "escada",
                    name: "Escada Antiderrapante:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "iluminacao_frontal",
                    name: "Iluminação Frontal:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "iluminacao_lateral",
                    name: "Iluminação Lateral:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "iluminacao_traseira",
                    name: "Iluminação Traseira:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "iluminacao_placa",
                    name: "Iluminação Placa Traseira:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "condicoes_pneus",
                    name: "Condições e Pressão dos Pneus:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "aperto_parafusos",
                    name: "Aperto dos parafusos das rodas:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "trinca_parabrisa",
                    name: "Trinca no parabrisa:",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                }
            ],
            sub_areas: []
        },
        {
            id: "area_cabine",
            name: "ITENS CABINE",
            type: "Padrão",
            items: [
                {
                    id: "computador_bordo",
                    name: "Computador de bordo",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "cronotacografo",
                    name: "Cronotacágrafo",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "cinto_seguranca_cabine",
                    name: "Cinto de Segurança",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "buzina",
                    name: "Buzina",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "vidros_limpador",
                    name: "Vidros, Limpador de para-brisa e espelhos",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "limpeza_cameras",
                    name: "Limpeza das câmeras embarcadas",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "cambio_embreagem",
                    name: "Câmbio / Embreagem",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "alarme_re",
                    name: "Alarme de ré e seta",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: [],
                        allow_photo: true,
                        allow_attachment: true
                    }
                },
                {
                    id: "freio_mao",
                    name: "Freio de Mão",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                }
            ],
            sub_areas: []
        },
        {
            id: "area_gerais",
            name: "ITENS GERAIS",
            type: "Padrão",
            items: [
                {
                    id: "cavalo_sem_avarias",
                    name: "Cavalo e semirreboque sem avarias",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "sistema_freio",
                    name: "Sistema de Freio (Cuíca, lona de freio, fluido de freio)",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "sistema_eletrico",
                    name: "Sistema Elétrico (Luzes e faróis) em funcionamento",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "rodas",
                    name: "Rodas (Condições e aperto dos parafusos)",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "pneus_gerais",
                    name: "Pneus (Pressão, condições e estepe)",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "quinta_roda",
                    name: "Quinta-roda e pino rei travado",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "vazamentos",
                    name: "Vazamentos (Ar, óleo, água)",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "agua_oleo",
                    name: "Água / Óleo (Nível e pressão)",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "suspensao",
                    name: "Suspensão",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "guarda_corpo",
                    name: "Guarda-corpo",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "baterias",
                    name: "Baterias",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "faixas_refletivas",
                    name: "Faixas refletivas",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "bocas_descarga",
                    name: "Bocas de descarga livres de violações",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "pontos_fuga",
                    name: "Pontos de fuga lacrados",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                }
            ],
            sub_areas: []
        }
    ]
};

// Gerar ID unico
function generateId() {
    return 'chk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Dados do template
const templateData = {
    id: generateId(),
    name: "[3° ETAPA] Checklist Veículo | Motorista",
    subject: "Inspeção de Veículo",
    description: "Checklist completo de inspeção veicular para motoristas - EPIs, equipamentos, documentação e condições do veículo",
    settings: settings,
    structure: structure,
    target_vehicle_types: [],
    assigned_user_ids: []
};

console.log('Criando template de checklist...\n');
console.log('Nome:', templateData.name);
console.log('Areas:', structure.areas.length);
console.log('Total de itens:', structure.areas.reduce((sum, area) => sum + area.items.length, 0));
console.log('\nEnviando para Supabase...\n');

// Criar template
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
            console.log('SUCESSO! Template criado com ID:', result[0].id);
            console.log('\nDetalhes:');
            console.log('- Nome:', result[0].name);
            console.log('- Subject:', result[0].subject);
            console.log('- Criado em:', result[0].created_at);
            console.log('\nTemplate pronto para usar na plataforma e no app mobile!');
        } else {
            console.error('ERRO ao criar template:');
            console.error('Status:', res.statusCode);
            console.error('Resposta:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('ERRO na requisicao:', error.message);
});

req.write(JSON.stringify(templateData));
req.end();
