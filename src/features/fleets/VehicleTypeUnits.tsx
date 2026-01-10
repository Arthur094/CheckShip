
import React, { useState } from 'react';

const VehicleTypeUnits: React.FC = () => {
    // Mock data for units
    const [units, setUnits] = useState([
        { id: 1, name: 'Matriz - São Paulo', type: 'Unidade Administrativa', linked: true },
        { id: 2, name: 'Filial - Rio de Janeiro', type: 'Unidade Operacional', linked: true },
        { id: 3, name: 'CD - Cajamar', type: 'Centro de Distribuição', linked: false },
        { id: 4, name: 'CD - Extrema', type: 'Centro de Distribuição', linked: false },
        { id: 5, name: 'Filial - Curitiba', type: 'Unidade Operacional', linked: false },
    ]);

    const handleBulkToggle = () => {
        const allLinked = units.every(u => u.linked);
        const targetState = !allLinked;

        setUnits(prev => prev.map(u => ({ ...u, linked: targetState })));
    };

    const handleToggle = (id: number) => {
        setUnits(prev => prev.map(u => u.id === id ? { ...u, linked: !u.linked } : u));
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="flex-1 overflow-y-auto px-8 py-8">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                        <div className="col-span-6">Unidade</div>
                        <div className="col-span-4">Tipo de Unidade</div>
                        <div className="col-span-2 text-right group flex items-center justify-end gap-2 cursor-pointer" onClick={handleBulkToggle}>
                            <span className="group-hover:hidden">Vincular</span>
                            <span className="hidden group-hover:block text-blue-600 font-extrabold text-[10px] tracking-wide bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shadow-sm transition-all">MARCAR TODOS</span>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-slate-100">
                        {units.map((unit) => (
                            <div key={unit.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
                                <div className="col-span-6 text-sm text-slate-700 font-medium">
                                    {unit.name}
                                </div>
                                <div className="col-span-4 text-sm text-slate-500">
                                    {unit.type}
                                </div>
                                <div className="col-span-2 flex justify-end">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={unit.linked}
                                            onChange={() => handleToggle(unit.id)}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleTypeUnits;
