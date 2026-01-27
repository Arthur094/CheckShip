/**
 * Validador de Placas Brasileiras
 * Suporta: Mercosul (ABC1D23) e Antiga (ABC-1234 ou ABC1234)
 */

export type PlateFormat = 'MERCOSUL' | 'ANTIGA' | 'INVALIDA';

export interface PlateValidationResult {
    isValid: boolean;
    format: PlateFormat;
    formatted: string; // Placa formatada (padronizada)
    message: string;
}

/**
 * Valida e identifica o formato de uma placa brasileira
 */
export function validatePlate(plate: string): PlateValidationResult {
    if (!plate) {
        return {
            isValid: false,
            format: 'INVALIDA',
            formatted: '',
            message: 'Placa obrigatória'
        };
    }

    // Remove espaços, hífens e converte para maiúscula
    const cleaned = plate.replace(/[\s\-]/g, '').toUpperCase();

    // Regex Mercosul: ABC1D23 (3 letras, 1 número, 1 letra, 2 números)
    const mercosulPattern = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

    // Regex Antiga: ABC1234 (3 letras, 4 números)
    const antigaPattern = /^[A-Z]{3}[0-9]{4}$/;

    if (mercosulPattern.test(cleaned)) {
        return {
            isValid: true,
            format: 'MERCOSUL',
            formatted: cleaned,
            message: 'Placa Mercosul válida'
        };
    }

    if (antigaPattern.test(cleaned)) {
        return {
            isValid: true,
            format: 'ANTIGA',
            formatted: cleaned,
            message: 'Placa antiga válida'
        };
    }

    return {
        isValid: false,
        format: 'INVALIDA',
        formatted: cleaned,
        message: 'Formato inválido. Aceito: ABC1D23 (Mercosul) ou ABC-1234'
    };
}

/**
 * Formata placa para exibição
 * - Mercosul: ABC1D23
 * - Antiga: ABC-1234
 */
export function formatPlateDisplay(plate: string): string {
    const validation = validatePlate(plate);

    if (!validation.isValid) return plate.toUpperCase();

    if (validation.format === 'ANTIGA') {
        // ABC1234 -> ABC-1234
        return `${validation.formatted.slice(0, 3)}-${validation.formatted.slice(3)}`;
    }

    // Mercosul não precisa de formatação
    return validation.formatted;
}
