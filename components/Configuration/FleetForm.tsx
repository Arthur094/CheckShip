
import React from 'react';

const FleetForm: React.FC = () => {
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
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all placeholder:text-slate-400"
                            placeholder="ABC-1234"
                        />
                        <div className="flex justify-end mt-1">
                            <span className="text-[10px] text-slate-400 font-medium">0 / 8</span>
                        </div>
                    </div>

                    <div className="col-span-12 md:col-span-4">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                            Tipo de Veículo *
                        </label>
                        <select className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all">
                            <option value="">Selecione...</option>
                            <option value="cavalo">Cavalo Mecânico</option>
                            <option value="carreta_bau">Carreta Baú</option>
                            <option value="carreta_sider">Carreta Sider</option>
                            <option value="truck">Truck</option>
                            <option value="vuc">VUC</option>
                        </select>
                    </div>

                    <div className="col-span-12 md:col-span-4">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                            Marca
                        </label>
                        <input
                            type="text"
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all placeholder:text-slate-400"
                            placeholder="Ex: Scania"
                        />
                    </div>

                    <div className="col-span-12 md:col-span-4">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                            Modelo
                        </label>
                        <input
                            type="text"
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all placeholder:text-slate-400"
                            placeholder="Ex: R450"
                        />
                    </div>

                    <div className="col-span-12 md:col-span-4">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                            Ano
                        </label>
                        <input
                            type="text"
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all placeholder:text-slate-400"
                            placeholder="Ex: 2023"
                        />
                    </div>
                    <div className="col-span-12 md:col-span-4">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                            Cor
                        </label>
                        <input
                            type="text"
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
