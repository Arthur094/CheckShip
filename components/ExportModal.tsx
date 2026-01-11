import React, { useState } from 'react';
import { X, FileText, Image as ImageIcon, FileSpreadsheet, FileJson, Download } from 'lucide-react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    inspectionId: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, inspectionId }) => {
    const [format, setFormat] = useState('pdf');

    if (!isOpen) return null;

    const handleExport = () => {
        alert('Funcionalidade em desenvolvimento');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800">Exportar Relatório</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-500 font-medium">Selecione o formato de exportação:</p>

                    <div className="grid grid-cols-1 gap-3">
                        <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${format === 'pdf' ? 'border-blue-900 bg-blue-50/50 ring-1 ring-blue-900' : 'border-slate-200 hover:border-blue-300'}`}>
                            <input type="radio" name="format" value="pdf" checked={format === 'pdf'} onChange={() => setFormat('pdf')} className="hidden" />
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${format === 'pdf' ? 'border-blue-900' : 'border-slate-300'}`}>
                                {format === 'pdf' && <div className="w-2.5 h-2.5 rounded-full bg-blue-900" />}
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                                <FileText size={20} />
                            </div>
                            <div>
                                <span className="font-bold text-slate-700 text-sm block">PDF Otimizado</span>
                                <span className="text-xs text-slate-400">Layout padrão (A4)</span>
                            </div>
                        </label>

                        <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${format === 'media' ? 'border-blue-900 bg-blue-50/50 ring-1 ring-blue-900' : 'border-slate-200 hover:border-blue-300'}`}>
                            <input type="radio" name="format" value="media" checked={format === 'media'} onChange={() => setFormat('media')} className="hidden" />
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${format === 'media' ? 'border-blue-900' : 'border-slate-300'}`}>
                                {format === 'media' && <div className="w-2.5 h-2.5 rounded-full bg-blue-900" />}
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                                <ImageIcon size={20} />
                            </div>
                            <div>
                                <span className="font-bold text-slate-700 text-sm block">Mídias (ZIP)</span>
                                <span className="text-xs text-slate-400">Fotos e anexos originais</span>
                            </div>
                        </label>

                        <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${format === 'xlsx' ? 'border-blue-900 bg-blue-50/50 ring-1 ring-blue-900' : 'border-slate-200 hover:border-blue-300'}`}>
                            <input type="radio" name="format" value="xlsx" checked={format === 'xlsx'} onChange={() => setFormat('xlsx')} className="hidden" />
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${format === 'xlsx' ? 'border-blue-900' : 'border-slate-300'}`}>
                                {format === 'xlsx' && <div className="w-2.5 h-2.5 rounded-full bg-blue-900" />}
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                                <FileSpreadsheet size={20} />
                            </div>
                            <div>
                                <span className="font-bold text-slate-700 text-sm block">Planilha Excel</span>
                                <span className="text-xs text-slate-400">Dados tabulados (.xlsx)</span>
                            </div>
                        </label>

                        <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${format === 'csv' ? 'border-blue-900 bg-blue-50/50 ring-1 ring-blue-900' : 'border-slate-200 hover:border-blue-300'}`}>
                            <input type="radio" name="format" value="csv" checked={format === 'csv'} onChange={() => setFormat('csv')} className="hidden" />
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${format === 'csv' ? 'border-blue-900' : 'border-slate-300'}`}>
                                {format === 'csv' && <div className="w-2.5 h-2.5 rounded-full bg-blue-900" />}
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                                <FileJson size={20} />
                            </div>
                            <div>
                                <span className="font-bold text-slate-700 text-sm block">Arquivo CSV</span>
                                <span className="text-xs text-slate-400">Texto separado por vírgulas</span>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold text-slate-500 uppercase hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-6 py-2 bg-blue-900 text-white rounded-lg flex items-center gap-2 text-xs font-bold uppercase hover:bg-blue-800 transition-colors shadow-lg active:scale-95"
                    >
                        <Download size={16} />
                        Exportar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;
