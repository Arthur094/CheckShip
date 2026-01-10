
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface VehicleType {
    id: string;
    name: string;
}

interface FleetFormProps {
    data: {
        plate: string;
        model: string;
        current_km: number | string;
        renavam: string;
        crlv_expiry: string;
        vehicle_type_id: string;
        brand: string;
        year: string;
        color: string;
    };
    onChange: (field: string, value: any) => void;
}

const FleetForm: React.FC<FleetFormProps> = ({ data, onChange }) => {
    const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
    const [loadingTypes, setLoadingTypes] = useState(false);

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                setLoadingTypes(true);
                const { data: types, error } = await supabase
                    .from('vehicle_types')
                    .select('id, name')
                    .order('name');

                if (error) throw error;
                setVehicleTypes(types || []);
            } catch (error: any) {
                console.error('Error fetching vehicle types:', error.message);
            } finally {
                setLoadingTypes(false);
            }
        };

        fetchTypes();
    }, []);

    return (
        <div className="p-8">
            <div className="max-w-4xl">
                <div className="grid grid-cols-12 gap-6">
                    {/* Identification */}
                    <div className="col-span-12 mb-2">
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-2">
                            Identificação
                        </h2>
                    </div>

                    <div className="col-span-12 md:col-span-4">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                            Placa *
                        </label>
                        <input
                            type="text"
                            value={data.plate}
                            onChange={(e) => onChange('plate', e.target.value.toUpperCase())}
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all placeholder:text-slate-400"
                            placeholder="ABC-1234"
                            maxLength={8}
                        />
                        <div className="flex justify-end mt-1">
                            <span className="text-[10px] text-slate-400 font-medium">{data.plate.length} / 8</span>
                        </div>
                    </div>

                    <div className="col-span-12 md:col-span-4">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                            Tipo de Veículo *
                        </label>
                        <select
                            value={data.vehicle_type_id}
                            onChange={(e) => onChange('vehicle_type_id', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all"
                        >
                            <option value="">{loadingTypes ? 'Carregando...' : 'Selecione...'}</option>
                            {vehicleTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-12 md:col-span-4">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                            Modelo *
                        </label>
                        <input
                            type="text"
                            value={data.model}
                            onChange={(e) => onChange('model', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all placeholder:text-slate-400"
                            placeholder="Ex: R450"
                        />
                    </div>

                    <div className="col-span-12 md:col-span-4">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                            KM Atual
                        </label>
                        <input
                            type="number"
                            value={data.current_km}
                            onChange={(e) => onChange('current_km', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all placeholder:text-slate-400"
                            placeholder="Ex: 50000"
                        />
                    </div>

                    <div className="col-span-12 md:col-span-4">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                            Renavam
                        </label>
                        <input
                            type="text"
                            value={data.renavam}
                            onChange={(e) => onChange('renavam', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all placeholder:text-slate-400"
                            placeholder="Ex: 123456789"
                        />
                    </div>

                    <div className="col-span-12 md:col-span-4">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                            Vencimento CRLV
                        </label>
                        <input
                            type="date"
                            value={data.crlv_expiry}
                            onChange={(e) => onChange('crlv_expiry', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all"
                        />
                    </div>

                    <div className="col-span-12 md:col-span-4">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                            Marca
                        </label>
                        <input
                            type="text"
                            value={data.brand}
                            onChange={(e) => onChange('brand', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all placeholder:text-slate-400"
                            placeholder="Ex: Scania"
                        />
                    </div>

                    <div className="col-span-12 md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                            Ano
                        </label>
                        <input
                            type="text"
                            value={data.year}
                            onChange={(e) => onChange('year', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all placeholder:text-slate-400"
                            placeholder="Ex: 2023"
                        />
                    </div>

                    <div className="col-span-12 md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                            Cor
                        </label>
                        <input
                            type="text"
                            value={data.color}
                            onChange={(e) => onChange('color', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all placeholder:text-slate-400"
                            placeholder="Ex: Branco"
                        />
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <span className="text-xs text-slate-400 italic">Campos com * são obrigatórios</span>
                </div>
            </div>
        </div>
    );
};

export default FleetForm;
