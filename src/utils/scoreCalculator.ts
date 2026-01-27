import { ChecklistTemplate, ItemType } from "../../types";

interface ScoreResult {
    score: number;        // Nota final (0 a 100)
    maxPoints: number;    // Total de pontos possíveis
    earnedPoints: number; // Pontos ganhos
    totalItems: number;   // Total de itens avaliados
    passed: boolean;      // Se atingiu a nota mínima
}

/**
 * Calcula a pontuação de um checklist respondido
 */
export function calculateChecklistScore(
    template: ChecklistTemplate,
    responses: Record<string, any>
): ScoreResult {
    let maxPoints = 0;
    let earnedPoints = 0;
    let totalItems = 0;

    // Percorre todas as áreas e itens do template
    template.structure.areas.forEach(area => {
        // Itens diretos da área
        area.items.forEach(item => {
            if (shouldScoreItem(item)) {
                totalItems++;
                maxPoints += 10; // Cada item vale 10 pontos base
                earnedPoints += getPointsForItem(item, responses[item.id]?.answer);
            }
        });

        // Sub-áreas
        area.sub_areas.forEach(sub => {
            sub.items.forEach(item => {
                if (shouldScoreItem(item)) {
                    totalItems++;
                    maxPoints += 10;
                    earnedPoints += getPointsForItem(item, responses[item.id]?.answer);
                }
            });
        });
    });

    // Evita divisão por zero
    if (maxPoints === 0) {
        return {
            score: 0,
            maxPoints: 0,
            earnedPoints: 0,
            totalItems: 0,
            passed: true // Se não tem itens avaliativos, considera aprovado?
        };
    }

    const score = (earnedPoints / maxPoints) * 100;

    return {
        score: parseFloat(score.toFixed(2)),
        maxPoints,
        earnedPoints,
        totalItems,
        // @ts-ignore - min_score_to_pass será adicionado no type em breve
        passed: score >= (template.min_score_to_pass || 70)
    };
}

/**
 * Verifica se o item deve contar para a pontuação
 */
function shouldScoreItem(item: any): boolean {
    // Apenas itens avaliativos contam
    if (item.type !== ItemType.AVALIATIVO) return false;

    // Se tiver configuração específica de peso 0, ignora (futuro)
    return true;
}

/**
 * Retorna os pontos ganhos baseado na resposta
 */
function getPointsForItem(item: any, answer: any): number {
    if (!answer) return 0; // Não respondido = 0 pontos

    // Lógica para Smileys / Conforme
    const goodAnswers = ['conforme', 'bom', 'otimo', 'sim'];
    const badAnswers = ['nao_conforme', 'ruim', 'pessimo', 'nao'];
    const neutralAnswers = ['regular', 'meh', 'na'];

    if (goodAnswers.includes(String(answer).toLowerCase())) {
        return 10; // Pontuação total
    }

    if (neutralAnswers.includes(String(answer).toLowerCase())) {
        return 5; // Meia pontuação (discutível, mas comum em auditorias)
    }

    if (badAnswers.includes(String(answer).toLowerCase())) {
        return 0; // Zero pontos
    }

    return 0;
}
