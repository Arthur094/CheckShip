
import React from 'react';
// import { Calendar, FileText, Upload, X } from 'lucide-react'; // Unused now
import { supabase } from '../../lib/supabase';

interface TrailerFormProps {
    data: any;
    onChange: (field: string, value: any) => void;
}

const TrailerForm: React.FC<TrailerFormProps> = ({ data, onChange }) => {
    /* Legacy refs removed */

    const validatePlate = (plate: string) => {
        const cleanPlate = plate.replace(/\W/g, '').toUpperCase();
        // Regex for Ancient: ABC1234
        const oldRegex = /^[A-Z]{3}[0-9]{4}$/;
        // Regex for Mercosul: ABC1D23
        const mercosulRegex = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

        return oldRegex.test(cleanPlate) || mercosulRegex.test(cleanPlate);
    };

    /* Legacy DocumentSection and handleFileUpload removed */

    const plateIsValid = data.plate ? validatePlate(data.plate) : true;

    return (
        <div className="p-8">
            <div className="max-w-5xl">
                <div className="grid grid-cols-12 gap-8">
                    {/* Primary Info */}
                    <div className="col-span-12 md:col-span-4">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                            Placa da Carreta *
                        </label>
                        <input
                            type="text"
                            value={data.plate}
                            onChange={(e) => onChange('plate', e.target.value.toUpperCase())}
                            className={`w-full bg-white border px-4 py-3 rounded-lg text-sm font-bold tracking-widest text-slate-700 focus:outline-none transition-all placeholder:text-slate-400 ${!plateIsValid ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-blue-900 focus:ring-1 focus:ring-blue-900'
                                }`}
                            placeholder="ABC-1234 ou ABC1A23"
                        />
                        {!plateIsValid && (
                            <p className="mt-1 text-[10px] text-red-500 font-bold uppercase italic">Formato de placa inválido</p>
                        )}
                        <p className="mt-2 text-[10px] text-slate-400 font-medium italic">
                            Suporta formato Mercosul e Antigo.
                        </p>
                    </div>

                    <div className="col-span-12 md:col-span-4">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                            Tipo de Implemento
                        </label>
                        <select
                            value={data.trailer_type || 'CARRETA'}
                            onChange={(e) => onChange('trailer_type', e.target.value)}
                            className="w-full bg-white border border-slate-200 px-4 py-3 rounded-lg text-sm font-bold tracking-wide text-slate-700 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all"
                        >
                            <option value="CARRETA">CARRETA / SEMIREBOQUE</option>
                            <option value="DOLLY">DOLLY</option>
                        </select>
                        <p className="mt-2 text-[10px] text-slate-400 font-medium italic">
                            Define a lista de documentos obrigatórios.
                        </p>
                    </div>


                    <div className="col-span-12">
                        {/* Legacy Document fields moved to specific 'Documentos' tab */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrailerForm;
