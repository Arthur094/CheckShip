
import React from 'react';

interface BranchFormProps {
    data: {
        name: string;
    };
    onChange: (field: string, value: string) => void;
}

const BranchForm: React.FC<BranchFormProps> = ({ data, onChange }) => {
    return (
        <div className="p-8">
            <div className="max-w-4xl">
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                            Nome da Filial *
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => onChange('name', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all placeholder:text-slate-400"
                            placeholder="Ex: Matriz São Paulo"
                        />
                        <div className="flex justify-end mt-1">
                            <span className="text-[10px] text-slate-400 font-medium">{data.name.length} / 100</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BranchForm;
