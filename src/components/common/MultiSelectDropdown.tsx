import React, { useState, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface MultiSelectDropdownProps {
    title: string;
    options: Array<{ id: string; label: string }>;
    selected: string[];
    onChange: (selected: string[]) => void;
    searchPlaceholder?: string;
    isOpen: boolean;
    onToggle: () => void;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
    title,
    options,
    selected,
    onChange,
    searchPlaceholder = 'Digite para pesquisar',
    isOpen,
    onToggle
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOptions = useMemo(() => {
        return options.filter(opt =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    const handleSelectAll = () => {
        onChange(filteredOptions.map(opt => opt.id));
    };

    const handleDeselectAll = () => {
        onChange([]);
    };

    const handleToggle = (id: string) => {
        if (selected.includes(id)) {
            onChange(selected.filter(s => s !== id));
        } else {
            onChange([...selected, id]);
        }
    };

    const allSelected = filteredOptions.length > 0 &&
        filteredOptions.every(opt => selected.includes(opt.id));

    return (
        <div className="relative">
            <button
                onClick={onToggle}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-left flex items-center justify-between hover:border-slate-400 transition-colors text-sm"
            >
                <span className={selected.length > 0 ? 'text-slate-900 font-medium' : 'text-slate-500'}>
                    {title}
                    {selected.length > 0 && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                            {selected.length}
                        </span>
                    )}
                </span>
                <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-300 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden flex flex-col">
                    {/* Search */}
                    <div className="p-3 border-b border-slate-200">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="px-3 py-2 border-b border-slate-200 flex items-center gap-4 bg-slate-50">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelectAll();
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium uppercase tracking-wide"
                        >
                            Marcar Todos
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeselectAll();
                            }}
                            className="text-xs text-slate-500 hover:text-slate-700 font-medium uppercase tracking-wide"
                        >
                            Desmarcar Todos
                        </button>
                    </div>

                    {/* Options List */}
                    <div className="overflow-y-auto flex-1">
                        {filteredOptions.length === 0 ? (
                            <div className="p-4 text-center text-sm text-slate-400">
                                Nenhuma opção encontrada
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <label
                                    key={option.id}
                                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(option.id)}
                                        onChange={() => handleToggle(option.id)}
                                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-700 flex-1">
                                        {option.label}
                                    </span>
                                </label>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;
