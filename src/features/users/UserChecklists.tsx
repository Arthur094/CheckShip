
import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

const UserChecklists: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const checklists = [
        { id: 1, name: '2ª Fase - Solicitação de Projeto', applies: true, report: false, email: false },
        { id: 2, name: 'Abastecimento | Cliente a Prazo', applies: true, report: false, email: false },
        { id: 3, name: 'Análise do local de parada | Logística', applies: true, report: false, email: false },
        { id: 4, name: 'Auditoria de Motorista | SSMA', applies: false, report: false, email: false },
        { id: 5, name: 'Auditoria de Veículo | SSMA', applies: false, report: false, email: false },
    ];

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="px-8 py-6">
                <div className="relative flex items-center bg-white rounded-lg border border-slate-200 shadow-sm">
                    <Search size={20} className="absolute left-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
                    />
                    <button className="absolute right-4 text-slate-400 hover:text-blue-900 transition-colors">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase text-center">
                        <div className="col-span-6 text-left flex items-center gap-1 cursor-pointer hover:text-slate-700">
                            Checklist <span>↓</span>
                        </div>
                        <div className="col-span-2">Aplica</div>
                        <div className="col-span-2">Relatório</div>
                        <div className="col-span-2">E-mail</div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {checklists.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
                                <div className="col-span-6 text-sm text-slate-700 font-medium text-left">
                                    {item.name}
                                </div>

                                {/* Aplica Toggle */}
                                <div className="col-span-2 flex justify-center">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked={item.applies} />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                </div>

                                {/* Relatório Toggle */}
                                <div className="col-span-2 flex justify-center">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked={item.report} />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                </div>

                                {/* Email Toggle */}
                                <div className="col-span-2 flex justify-center">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked={item.email} />
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

export default UserChecklists;
