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
                    id: "nome_motorista",
                    name: "Nome do motorista",
                    type: "Texto",
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
            id: "area_sintomas_fadiga",
            name: "Sintomas de Fadiga",
            type: "Padrão",
            items: [
                {
                    id: "sintoma_sonolento",
                    name: "Marque SIM se você afirma NÃO ESTÁ se sentindo sonolento ou cansado e NÃO caso ESTEJA sonolento ou cansado.",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "sintoma_olhos",
                    name: "Marque SIM se você NÃO TEM dificuldade em manter os olhos abertos ou piscando frequentemente e NÃO caso você TENHA dificuldade em manter os olhos abertos ou piscando frequentemente.",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "sintoma_bocejo",
                    name: "Marque SIM se você NÃO ESTÁ bocejando com frequência e NÃO caso você ESTEJA bocejando com frequência.",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "sintoma_concentracao",
                    name: "Marque SIM se você NÃO ESTÁ tendo dificuldade em se concentrar na estrada ou nas condições de tráfego e NÃO caso TENHA dificuldade em se concentrar na estrada ou nas condições de tráfego.",
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
            id: "area_fatores_risco",
            name: "Fatores de Risco de Fadiga",
            type: "Padrão",
            items: [
                {
                    id: "horas_sono",
                    name: "Quantas horas você dormiu nas últimas 24 horas?",
                    type: "Lista de Seleção",
                    config: {
                        hint: "",
                        options: ["Menos de 6 horas", "6 a 7 horas", "Mais de 7 horas"],
                        selection_type: "single",
                        selection_options: ["Menos de 6 horas", "6 a 7 horas", "Mais de 7 horas"]
                    }
                },
                {
                    id: "consumo_alcool",
                    name: "Marque SIM caso NÃO HOUVE consumo de álcool nas últimas 24 horas e NÃO caso HOUVE consumo de álcool nas últimas 24 horas.",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "medicamento_sonolencia",
                    name: "Marque SIM caso NÃO TENHA ingerido algum medicamento que pode causar sonolência e NÃO caso TENHA ingerido algum medicamento que pode causar sonolência.",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        selection_options: []
                    }
                },
                {
                    id: "horas_dirigidas",
                    name: "Quantas horas você já dirigiu hoje?",
                    type: "Lista de Seleção",
                    config: {
                        hint: "",
                        options: ["Menos de 2 horas", "2 a 4 horas", "Mais de 4 horas"],
                        selection_type: "single",
                        selection_options: ["Menos de 2 horas", "2 a 4 horas", "Mais de 4 horas"]
                    }
                }
            ],
            sub_areas: []
        },
        {
            id: "area_avaliacao_geral",
            name: "Avaliação Geral",
            type: "Padrão",
            items: [
                {
                    id: "condicoes_dirigir",
                    name: "Com base nas suas respostas, você acredita que está em condições de dirigir com segurança neste momento?",
                    type: "Avaliativo",
                    config: {
                        hint: "",
                        options: [],
                        allow_photo: true,
                        allow_attachment: true,
                        selection_options: []
                    }
                },
                {
                    id: "comentarios_adicionais",
                    name: "Comentários adicionais (se necessário):",
                    type: "Texto",
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
            id: "area_aviso",
            name: "Aviso",
            type: "Padrão",
            items: [],
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
    name: "[2°ETAPA] Formulário de Detecção de Fadiga para Motoristas",
    subject: "Detecção de Fadiga",
    description: "Checklist para avaliação de fadiga de motoristas antes de iniciar viagem",
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
