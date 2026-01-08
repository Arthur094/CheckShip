
import React from 'react';

const FleetUsers: React.FC = () => {
    // Mock data for users
    const users = [
        { id: 1, name: 'João Silva', type: 'Motorista', linked: true },
        { id: 2, name: 'Maria Oliveira', type: 'Motorista', linked: false },
        { id: 3, name: 'Pedro Santos', type: 'Motorista', linked: false },
        { id: 4, name: 'Admin Gestor', type: 'Administrador', linked: true },
    ];

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="flex-1 overflow-y-auto px-8 py-8">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                        <div className="col-span-6">Usuário</div>
                        <div className="col-span-4">Tipo de Usuário</div>
                        <div className="col-span-2 text-right">Vincular</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-slate-100">
                        {users.map((user) => (
                            <div key={user.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
                                <div className="col-span-6 text-sm text-slate-700 font-medium">
                                    {user.name}
                                </div>
                                <div className="col-span-4 text-sm text-slate-500">
                                    {user.type}
                                </div>
                                <div className="col-span-2 flex justify-end">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked={user.linked} />
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

export default FleetUsers;
