
import React, { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Pencil,
    Trash2,
    Ban
} from 'lucide-react';

interface VehicleType {
    id: string;
    name: string;
}

interface VehicleTypeListProps {
    onNew: () => void;
    onEdit: (vehicleType: VehicleType) => void;
}

const VehicleTypeList: React.FC<VehicleTypeListProps> = ({ onNew, onEdit }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Mock data
    const vehicleTypes: VehicleType[] = [
        { id: '1', name: 'Cavalo Mecânico' },
        { id: '2', name: 'Carreta Baú' },
        { id: '3', name: 'Carreta Sider' },
        { id: '4', name: 'Bitrem' },
        { id: '5', name: 'Rodotrem' },
        { id: '6', name: 'VUC' },
        { id: '7', name: 'Toco' },
        { id: '8', name: 'Truck' },
    ];

    const filteredTypes = vehicleTypes.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleMenu = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setActiveMenu(activeMenu === id ? null : id);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="bg-white px-8 py-5 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-slate-800">Tipos de Veículo</h1>
                </div>
                <button
                    onClick={onNew}
                    className="bg-blue-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-800 transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    NOVO
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white px-8 py-6 border-b border-slate-200">
                <div className="relative flex items-center">
                    <Search size={20} className="absolute left-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all placeholder:text-slate-400 bg-slate-50"
                    />
                    <button className="absolute right-4 text-slate-400 hover:text-blue-900 transition-colors">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* List content */}
            <div className="flex-1 overflow-x-auto p-8">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden min-w-[800px]">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                        <div className="col-span-12 flex items-center gap-2">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900" />
                            Nome
                        </div>
                    </div>

                    {/* Table Rows */}
                    <div className="divide-y divide-slate-100">
                        {filteredTypes.map((type) => (
                            <div
                                key={type.id}
                                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors group relative"
                            >
                                <div className="col-span-12 flex items-center gap-4 justify-between">
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <span className="text-sm font-medium text-slate-700">{type.name}</span>
                                    </div>

                                    {/* Hover Actions */}
                                    <div className={`flex items-center gap-2 ${activeMenu === type.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                        <button
                                            onClick={() => onEdit(type)}
                                            className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-blue-900 transition-colors"
                                            title="Editar"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <div className="relative">
                                            <button
                                                onClick={(e) => toggleMenu(e, type.id)}
                                                className={`p-2 rounded-full transition-colors ${activeMenu === type.id ? 'bg-slate-200 text-slate-700' : 'hover:bg-slate-200 text-slate-400 hover:text-slate-700'}`}
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {activeMenu === type.id && (
                                                <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                                                    <button
                                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                        onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }}
                                                    >
                                                        <Trash2 size={16} />
                                                        Excluir
                                                    </button>
                                                    <button
                                                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                                        onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }}
                                                    >
                                                        <Ban size={16} />
                                                        Desativar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleTypeList;
