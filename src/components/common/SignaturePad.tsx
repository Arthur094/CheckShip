import React, { useRef, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X, Check, RotateCcw } from 'lucide-react';

interface SignaturePadProps {
    onSave: (dataUrl: string) => void;
    onCancel?: () => void;
    title?: string;
    subtitle?: string;
    required?: boolean;
    width?: number;
    height?: number;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
    onSave,
    onCancel,
    title = 'Assinatura',
    subtitle = 'Desenhe sua assinatura no campo abaixo',
    required = false,
    width,
    height = 150,
}) => {
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [isEmpty, setIsEmpty] = React.useState(true);

    const clear = useCallback(() => {
        sigCanvas.current?.clear();
        setIsEmpty(true);
    }, []);

    const handleEnd = useCallback(() => {
        setIsEmpty(sigCanvas.current?.isEmpty() ?? true);
    }, []);

    const handleSave = useCallback(() => {
        if (sigCanvas.current) {
            const isCanvasEmpty = sigCanvas.current.isEmpty();
            if (isCanvasEmpty && required) {
                alert('Por favor, desenhe sua assinatura antes de confirmar.');
                return;
            }
            if (!isCanvasEmpty) {
                // Get original canvas
                const originalCanvas = sigCanvas.current.getCanvas();

                // Create a temporary canvas to resize the image
                const validationCanvas = document.createElement('canvas');
                const ctx = validationCanvas.getContext('2d');

                if (ctx) {
                    // Set compressed dimensions (50% of original or max 400px width)
                    const maxWidth = 500;
                    const scale = Math.min(1, maxWidth / originalCanvas.width);

                    validationCanvas.width = originalCanvas.width * scale;
                    validationCanvas.height = originalCanvas.height * scale;

                    // Draw original image to smaller canvas
                    ctx.drawImage(originalCanvas, 0, 0, validationCanvas.width, validationCanvas.height);

                    // Get compressed data URL
                    const dataUrl = validationCanvas.toDataURL('image/png');
                    onSave(dataUrl);
                } else {
                    // Fallback to original if context fails
                    const dataUrl = sigCanvas.current.toDataURL('image/png');
                    onSave(dataUrl);
                }
            }
        }
    }, [onSave, required]);

    return (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        ✍️ {title}
                        {required && <span className="text-red-500 text-sm">(Obrigatório)</span>}
                    </h3>
                    <p className="text-sm text-slate-500">{subtitle}</p>
                </div>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-slate-400" />
                    </button>
                )}
            </div>

            {/* Canvas Container */}
            <div
                className="border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 mb-4 overflow-hidden"
                style={{ height: height }}
            >
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{
                        width: width || undefined,
                        height: height,
                        className: 'w-full h-full cursor-crosshair',
                        style: {
                            width: '100%',
                            height: '100%',
                            touchAction: 'none' // Prevent scroll on touch
                        }
                    }}
                    onEnd={handleEnd}
                />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={clear}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                    <RotateCcw size={18} />
                    Limpar
                </button>
                <button
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-colors bg-blue-900 text-white hover:bg-blue-800"
                >
                    <Check size={18} />
                    Confirmar
                </button>
            </div>

            {/* Helper text */}
            {isEmpty && required && (
                <p className="text-xs text-red-500 text-center mt-3">
                    Por favor, desenhe sua assinatura para continuar
                </p>
            )}
        </div>
    );
};

export default SignaturePad;
