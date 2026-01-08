
import React, { useState } from 'react';
import { Search } from 'lucide-react';

const VehicleTypeChecklists: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const checklists = [
        { id: 1, name: 'Checklist Diário - Cavalo Mecânico', linked: true },
        { id: 2, name: 'Inspeção de Pneus - Semanal', linked: true },
        { id: 3, name: 'Checklist de Saída - Carreta Baú', linked: false },
        { id: 4, name: 'Checklist de Entrada - Sider', linked: false },
        { id: 5, name: 'Vistoria Mensal - Frota Leve', linked: false },
    ];

    const filteredChecklists = checklists.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="px-8 py-6">
                <div className="relative flex items-center bg-white rounded-lg border border-slate-200 shadow-sm">
                    <Search size={20} className="absolute left-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar checklist"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                        <div className="col-span-10">Checklist</div>
                        <div className="col-span-2 text-right">Vincular</div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {filteredChecklists.map((checklist) => (
                            <div key={checklist.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
                                <div className="col-span-10 text-sm text-slate-700 font-medium">
                                    {checklist.name}
                                </div>
                                <div className="col-span-2 flex justify-end">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked={checklist.linked} />
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

export default VehicleTypeChecklists;
