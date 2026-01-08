
import React, { useState } from 'react';
import { Search } from 'lucide-react';

const FleetChecklists: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const checklists = [
        { id: 1, name: 'Checklist Diário - Cavalo Mecânico', applies: true, report: true, email: false },
        { id: 2, name: 'Inspeção de Pneus - Semanal', applies: true, report: false, email: true },
        { id: 3, name: 'Checklist de Saída - Carreta Baú', applies: false, report: false, email: false },
        { id: 4, name: 'Vistoria Mensal', applies: false, report: false, email: false },
    ];

    const filteredChecklists = checklists.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const Toggle = ({ checked }: { checked: boolean }) => (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked={checked} />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
        </label>
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
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase text-center items-center">
                        <div className="col-span-6 text-left">Checklist</div>
                        <div className="col-span-2">Aplica</div>
                        <div className="col-span-2">Relatório</div>
                        <div className="col-span-2">E-mail</div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {filteredChecklists.map((checklist) => (
                            <div key={checklist.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
                                <div className="col-span-6 text-sm text-slate-700 font-medium">
                                    {checklist.name}
                                </div>
                                <div className="col-span-2 flex justify-center">
                                    <Toggle checked={checklist.applies} />
                                </div>
                                <div className="col-span-2 flex justify-center">
                                    <Toggle checked={checklist.report} />
                                </div>
                                <div className="col-span-2 flex justify-center">
                                    <Toggle checked={checklist.email} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FleetChecklists;
