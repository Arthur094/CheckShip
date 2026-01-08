
import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

const UserVehicles: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const vehicles = [
        { id: 1, name: 'AAA-1020 | Scania R450', type: 'Cavalo Mecânico', linked: true },
        { id: 2, name: 'BBB-2030 | Volvo FH 540', type: 'Cavalo Mecânico', linked: false },
        { id: 3, name: 'CCC-3040 | Mercedes-Benz Actros', type: 'Cavalo Mecânico', linked: false },
        { id: 4, name: 'DDD-4050 | Carreta Baú', type: 'Carreta', linked: false },
        { id: 5, name: 'EEE-5060 | Carreta Sider', type: 'Carreta', linked: false },
    ];

    const filteredVehicles = vehicles.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="px-8 py-6">
                <div className="relative flex items-center bg-white rounded-lg border border-slate-200 shadow-sm">
                    <Search size={20} className="absolute left-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar veículo"
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
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                        <div className="col-span-8 flex items-center gap-1 cursor-pointer hover:text-slate-700">
                            Veículo <span>↓</span>
                        </div>
                        <div className="col-span-2">Tipo</div>
                        <div className="col-span-2 text-right">Vincular</div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {filteredVehicles.map((vehicle) => (
                            <div key={vehicle.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
                                <div className="col-span-8 text-sm text-slate-700 font-medium">
                                    {vehicle.name}
                                </div>
                                <div className="col-span-2 text-sm text-slate-500">
                                    {vehicle.type}
                                </div>
                                <div className="col-span-2 flex justify-end">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked={vehicle.linked} />
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

export default UserVehicles;
