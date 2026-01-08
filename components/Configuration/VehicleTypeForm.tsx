
import React from 'react';

const VehicleTypeForm: React.FC = () => {
    return (
        <div className="p-8">
            <div className="max-w-4xl">
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                            Nome *
                        </label>
                        <input
                            type="text"
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all placeholder:text-slate-400"
                            placeholder="Ex: Cavalo Mecânico"
                        />
                        <div className="flex justify-end mt-1">
                            <span className="text-[10px] text-slate-400 font-medium">0 / 100</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleTypeForm;
