import React, { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { validatePlate } from '../../utils/plateValidator';

interface PlateInputProps {
    value: string;
    onChange: (value: string) => void;
    onValidityChange?: (isValid: boolean) => void;
    required?: boolean;
    disabled?: boolean;
    className?: string; // Permitir estilização externa
}

const PlateInput: React.FC<PlateInputProps> = ({
    value,
    onChange,
    onValidityChange,
    required = false,
    disabled = false,
    className = ''
}) => {
    const [validation, setValidation] = useState(validatePlate(value));
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        const result = validatePlate(value);
        setValidation(result);
        // Só notifica validade se o valor não for vazio (ou se required for true)
        // Se for obrigatório e vazio, é inválido. Se não for obrigatório e vazio, teoricamente é válido (mas depende do contexto pai)
        // Aqui vamos passar o isValid do validador, que retorna false para vazio se tratarmos vazio.
        // O validador atual retorna INVALIDA para vazio.
        onValidityChange?.(result.isValid);
    }, [value, onValidityChange]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove caracteres especiais não permitidos (opcional, mas bom pra UX)
        // Permitir letras, numeros e hifen
        const newValue = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');

        // Limite de caracteres (Hifen + 7 caracteres = 8 max)
        if (newValue.length <= 8) {
            onChange(newValue);
        }
    };

    const handleBlur = () => {
        setTouched(true);
        // Auto-formatar ao sair do campo se for válida antiga
        if (validation.isValid && validation.format === 'ANTIGA') {
            // Garante formato com hífen para visualização
            const formatted = `${validation.formatted.slice(0, 3)}-${validation.formatted.slice(3)}`;
            onChange(formatted);
        }
    };

    const showError = touched && !validation.isValid && value.length > 0;
    const showSuccess = touched && validation.isValid;

    return (
        <div className={`space-y-1 ${className}`}>
            <label className="block text-sm font-bold text-slate-700">
                Placa {required && <span className="text-red-500">*</span>}
            </label>

            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={disabled}
                    placeholder="ABC1D23 ou ABC-1234"
                    className={`
            w-full px-4 py-2.5 pr-10 border rounded-lg font-mono text-sm uppercase
            transition-all duration-200
            ${showError ? 'border-red-300 bg-red-50 focus:ring-red-200' : ''}
            ${showSuccess ? 'border-green-300 bg-green-50 focus:ring-green-200' : ''}
            ${!touched || value.length === 0 ? 'border-slate-200 focus:ring-blue-200' : ''}
            focus:outline-none focus:ring-2
            disabled:bg-slate-100 disabled:cursor-not-allowed
          `}
                />

                {/* Icon Indicator */}
                {value.length > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {validation.isValid ? (
                            <Check className="text-green-500" size={20} />
                        ) : touched ? (
                            <AlertCircle className="text-red-500" size={20} />
                        ) : null}
                    </div>
                )}
            </div>

            {/* Validation Message */}
            {touched && value.length > 0 && !validation.isValid && (
                <p className="text-xs font-medium text-red-600 animate-in slide-in-from-top-1">
                    {validation.message}
                </p>
            )}

            {touched && validation.isValid && (
                <p className="text-xs font-medium text-green-600 animate-in slide-in-from-top-1">
                    {validation.format === 'MERCOSUL' ? 'Formato Mercosul detectado' : 'Formato Antigo detectado'}
                </p>
            )}

            {/* Helper Text - mostra só quando não toucado ou vazio */}
            {(!touched || value.length === 0) && (
                <p className="text-xs text-slate-500">
                    Formatos: ABC1D23 (Mercosul) ou ABC-1234
                </p>
            )}
        </div>
    );
};

export default PlateInput;
