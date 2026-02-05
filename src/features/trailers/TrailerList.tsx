
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Pencil,
    Trash2,
    ToggleLeft,
    ToggleRight,
    X,
    Cloud,
    Truck
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Trailer {
    id: string;
    plate: string;
    active: boolean;
    vehicles?: { id: string; plate: string; }[];
}

interface TrailerListProps {
    onNew: () => void;
    onEdit: (trailer: Trailer) => void;
}

const TrailerList: React.FC<TrailerListProps> = ({ onNew, onEdit }) => {
    const [trailers, setTrailers] = useState<Trailer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTrailers, setSelectedTrailers] = useState<Set<string>>(new Set());
    const [showSelectAll, setShowSelectAll] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [filters, setFilters] = useState<{ active: string[] }>({ active: [] });
    const menuRef = useRef<HTMLDivElement>(null);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch trailers
            const { data: trailersData, error: trailersError } = await supabase
                .from('trailers')
                .select('*')
                .order('plate');

            if (trailersError) throw trailersError;

            // Fetch all vehicles to map trailer relationships
            const { data: vehiclesData, error: vehiclesError } = await supabase
                .from('vehicles')
                .select('id, plate, trailer_id_1, trailer_id_2, trailer_id_3');

            if (vehiclesError) throw vehiclesError;

            // Map trailers with their linked vehicles
            const trailersWithVehicles = (trailersData || []).map((trailer: any) => {
                const linkedVehicles = (vehiclesData || [])
                    .filter((v: any) =>
                        v.trailer_id_1 === trailer.id ||
                        v.trailer_id_2 === trailer.id ||
                        v.trailer_id_3 === trailer.id
                    )
                    .map((v: any) => ({ id: v.id, plate: v.plate }));

                return {
                    ...trailer,
                    active: trailer.active ?? true,
                    vehicles: linkedVehicles
                };
            });

            setTrailers(trailersWithVehicles);
        } catch (error: any) {
            console.error('Error fetching trailers:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredTrailers = useMemo(() => {
        return trailers.filter(t => {
            const matchesSearch = t.plate.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesActive = filters.active.length === 0 ||
                (filters.active.includes('Ativo') && t.active) ||
                (filters.active.includes('Inativo') && !t.active);
            return matchesSearch && matchesActive;
        });
    }, [trailers, searchTerm, filters]);

    const hasActiveFilters = filters.active.length > 0;

    const toggleMenu = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setActiveMenu(activeMenu === id ? null : id);
    };

    const handleSelectTrailer = (id: string) => {
        const newSelection = new Set(selectedTrailers);
        newSelection.has(id) ? newSelection.delete(id) : newSelection.add(id);
        setSelectedTrailers(newSelection);
    };

    const handleSelectAll = () => {
        setSelectedTrailers(new Set(filteredTrailers.map(t => t.id)));
        setShowSelectAll(false);
    };

    const handleDeselectAll = () => setSelectedTrailers(new Set());

    const handleBulkDelete = async () => {
        if (selectedTrailers.size === 0) return;
        if (!confirm(`Excluir ${selectedTrailers.size} carretas?`)) return;
        try {
            setLoading(true);
            const { error } = await supabase.from('trailers').delete().in('id', Array.from(selectedTrailers));
            if (error) throw error;
            alert(`${selectedTrailers.size} carretas excluídas!`);
            setSelectedTrailers(new Set());
            fetchData();
        } catch (error: any) {
            alert('Erro: ' + error.message);
            setLoading(false);
        }
    };

    const handleBulkToggleActive = async () => {
        if (selectedTrailers.size === 0) return;
        const selectedData = trailers.filter(t => selectedTrailers.has(t.id));
        const allActive = selectedData.every(t => t.active);
        const newStatus = !allActive;
        if (!confirm(`${allActive ? 'Desativar' : 'Ativar'} ${selectedTrailers.size} carretas?`)) return;
        try {
            setLoading(true);
            const { error } = await supabase.from('trailers').update({ active: newStatus }).in('id', Array.from(selectedTrailers));
            if (error) throw error;
            setSelectedTrailers(new Set());
            fetchData();
        } catch (error: any) {
            alert('Erro: ' + error.message);
            setLoading(false);
        }
    };

    const handleBulkExport = () => {
        if (selectedTrailers.size === 0) return;
        const selectedData = trailers.filter(t => selectedTrailers.has(t.id));
        const csvContent = [
            ['Placa', 'Cavalos Vinculados', 'Status'],
            ...selectedData.map(t => [t.plate, t.vehicles?.length || 0, t.active ? 'Ativo' : 'Inativo'])
        ].map(e => e.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `carretas_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handleDeleteSingle = async (trailer: Trailer) => {
        if (!confirm(`Excluir carreta "${trailer.plate}"?`)) return;
        try {
            setLoading(true);
            const { error } = await supabase.from('trailers').delete().eq('id', trailer.id);
            if (error) throw error;
            fetchData();
        } catch (error: any) {
            alert('Erro: ' + error.message);
            setLoading(false);
        }
    };

    const handleToggleActiveSingle = async (trailer: Trailer) => {
        if (!confirm(`${trailer.active ? 'Desativar' : 'Ativar'} carreta "${trailer.plate}"?`)) return;
        try {
            setLoading(true);
            const { error } = await supabase.from('trailers').update({ active: !trailer.active }).eq('id', trailer.id);
            if (error) throw error;
            fetchData();
        } catch (error: any) {
            alert('Erro: ' + error.message);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            {/* Header */}
            <div className="bg-white px-8 py-5 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-slate-800">Carretas</h1>
                    <p className="text-sm text-slate-500 hidden md:block">Gestão de Implementos</p>
                </div>
                <button
                    onClick={onNew}
                    className="bg-blue-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-800 transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    NOVA CARRETA
                </button>
            </div>

            {/* Search */}
            <div className="bg-white px-8 py-6 border-b border-slate-200">
                <div className="relative flex items-center">
                    <Search size={20} className="absolute left-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por placa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all placeholder:text-slate-400 bg-slate-50"
                    />
                    <button
                        onClick={() => setShowFilterPanel(!showFilterPanel)}
                        className={`absolute right-4 transition-colors ${showFilterPanel || hasActiveFilters ? 'text-blue-900' : 'text-slate-400 hover:text-blue-900'}`}
                    >
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilterPanel && (
                <div className="bg-white px-8 py-6 border-b border-slate-200">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-xs font-bold text-slate-500 uppercase">Status:</span>
                        {['Ativo', 'Inativo'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilters(prev => ({
                                    ...prev,
                                    active: prev.active.includes(status)
                                        ? prev.active.filter(s => s !== status)
                                        : [...prev.active, status]
                                }))}
                                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${filters.active.includes(status)
                                    ? 'bg-blue-900 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setFilters({ active: [] })} className="text-xs text-slate-500 hover:text-slate-700">
                        Limpar filtros
                    </button>
                </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-x-auto p-8">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden min-w-[600px] mb-20">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                        <div
                            className="col-span-6 flex items-center gap-2 relative"
                            onMouseEnter={() => setShowSelectAll(true)}
                            onMouseLeave={() => setShowSelectAll(false)}
                        >
                            {showSelectAll && selectedTrailers.size === 0 && (
                                <button onClick={handleSelectAll} className="absolute -left-1 px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded shadow-sm hover:bg-blue-700 z-10">
                                    TODOS
                                </button>
                            )}
                            {selectedTrailers.size > 0 && (
                                <button onClick={handleDeselectAll} className="text-blue-600 hover:text-blue-800 mr-2" title="Desmarcar todos">
                                    <X size={16} />
                                </button>
                            )}
                            {!showSelectAll && selectedTrailers.size === 0 && <span className="text-slate-400 px-1 mr-2">-</span>}
                            Placa
                        </div>
                        <div className="hidden md:block col-span-4">Cavalos Vinculados</div>
                        <div className="hidden md:block col-span-2 text-right">Status</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-slate-100">
                        {loading ? (
                            <div className="p-12 text-center text-slate-400">
                                <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
                                <p className="text-sm">Carregando...</p>
                            </div>
                        ) : filteredTrailers.length === 0 ? (
                            <div className="p-12 text-center text-slate-400">
                                <Truck size={48} className="mx-auto mb-4 opacity-50" />
                                <p className="text-sm">Nenhuma carreta encontrada.</p>
                            </div>
                        ) : (
                            filteredTrailers.map((trailer) => (
                                <div
                                    key={trailer.id}
                                    className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors group relative ${selectedTrailers.has(trailer.id) ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                                >
                                    <div className="col-span-6 flex items-center gap-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedTrailers.has(trailer.id)}
                                            onChange={() => handleSelectTrailer(trailer.id)}
                                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                        />
                                        <span className="text-sm font-bold text-slate-700">{trailer.plate}</span>
                                    </div>
                                    <div className="hidden md:block col-span-4 text-sm text-slate-600">
                                        {trailer.vehicles?.length || 0} veículo{(trailer.vehicles?.length || 0) !== 1 ? 's' : ''}
                                    </div>
                                    <div className="hidden md:flex col-span-2 items-center justify-end gap-3">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${trailer.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {trailer.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                        <div className={`flex items-center gap-1 ${activeMenu === trailer.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                            <button onClick={() => onEdit(trailer)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-blue-900" title="Editar">
                                                <Pencil size={16} />
                                            </button>
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => toggleMenu(e, trailer.id)}
                                                    className={`p-2 rounded-full transition-colors ${activeMenu === trailer.id ? 'bg-slate-200 text-slate-700' : 'hover:bg-slate-200 text-slate-400'}`}
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                                {activeMenu === trailer.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                                                        <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                                                            <button
                                                                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                                                onClick={(e) => { e.stopPropagation(); setActiveMenu(null); handleToggleActiveSingle(trailer); }}
                                                            >
                                                                {trailer.active ? <><ToggleLeft size={16} /> Desativar</> : <><ToggleRight size={16} /> Ativar</>}
                                                            </button>
                                                            <div className="border-t border-slate-100" />
                                                            <button
                                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                onClick={(e) => { e.stopPropagation(); setActiveMenu(null); handleDeleteSingle(trailer); }}
                                                            >
                                                                <Trash2 size={16} /> Excluir
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            {selectedTrailers.size > 0 && (
                <div className="sticky bottom-0 bg-white border-t border-slate-200 px-8 py-4 flex items-center justify-between shadow-lg z-30">
                    <div className="flex items-center gap-4">
                        <button onClick={handleBulkDelete} className="p-2 hover:bg-red-50 rounded-lg text-slate-600 hover:text-red-600" title="Excluir selecionados">
                            <Trash2 size={20} />
                        </button>
                        <button onClick={handleBulkToggleActive} className="p-2 hover:bg-blue-50 rounded-lg text-slate-600 hover:text-blue-600" title="Ativar/Inativar selecionados">
                            {trailers.filter(t => selectedTrailers.has(t.id)).every(t => t.active) ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        </button>
                        <button onClick={handleBulkExport} className="p-2 hover:bg-green-50 rounded-lg text-slate-600 hover:text-green-600" title="Exportar selecionados">
                            <Cloud size={20} />
                        </button>
                    </div>
                    <div className="text-sm text-slate-600 font-medium">
                        {selectedTrailers.size} de {filteredTrailers.length} selecionado{selectedTrailers.size !== 1 ? 's' : ''}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrailerList;
