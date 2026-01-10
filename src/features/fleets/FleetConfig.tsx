
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import FleetForm from './FleetForm';
import FleetUsers from './FleetUsers';
import FleetChecklists from './FleetChecklists';
import { supabase } from '../../lib/supabase';

interface FleetConfigProps {
    onBack: () => void;
    initialData?: any;
}

const FleetConfig: React.FC<FleetConfigProps> = ({ onBack, initialData }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        id: initialData?.id || null,
        plate: initialData?.plate || '',
        model: initialData?.model || '',
        current_km: initialData?.current_km || '',
        renavam: initialData?.renavam || '',
        crlv_expiry: initialData?.crlv_expiry || '',
        vehicle_type_id: initialData?.vehicle_type_id || '',
        brand: initialData?.brand || '',
        year: initialData?.year || '',
        color: initialData?.color || '',
        active: initialData?.active !== undefined ? initialData.active : true
    });

    // Ensure we have a UUID even for new vehicles to allow assignments
    const [idForAssignments] = useState(formData.id || crypto.randomUUID());

    const isNew = !formData.id;

    useEffect(() => {
        if (initialData) {
            setFormData({
                id: initialData.id,
                plate: initialData.plate || '',
                model: initialData.model || '',
                current_km: initialData.current_km || '',
                renavam: initialData.renavam || '',
                crlv_expiry: initialData.crlv_expiry || '',
                vehicle_type_id: initialData.vehicle_type_id || '',
                brand: initialData.brand || '',
                year: initialData.year || '',
                color: initialData.color || '',
                active: initialData.active !== undefined ? initialData.active : true
            });
        }
    }, [initialData]);

    const handleFieldChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const performSave = async (silent = false) => {
        if (!formData.plate.trim() || !formData.model.trim()) {
            if (!silent) alert('Placa e Modelo são obrigatórios.');
            return false;
        }

        try {
            if (!silent) setLoading(true);

            // Manual mapping to snake_case for Supabase
            // Handling integer conversion for current_km and year
            const payload = {
                id: idForAssignments,
                plate: formData.plate,
                model: formData.model,
                current_km: formData.current_km !== undefined && formData.current_km !== null && formData.current_km.toString().trim() !== ""
                    ? parseInt(formData.current_km.toString())
                    : 0,
                renavam: formData.renavam,
                crlv_expiry: formData.crlv_expiry || null,
                vehicle_type_id: formData.vehicle_type_id || null,
                brand: formData.brand,
                year: formData.year !== undefined && formData.year !== null && formData.year.toString().trim() !== ""
                    ? parseInt(formData.year.toString())
                    : null,
                color: formData.color,
                active: formData.active
            };

            const { error } = await supabase
                .from('vehicles')
                .upsert(payload);

            if (error) throw error;

            if (!silent) {
                // If it's a new vehicle, we want a special message and potentially not close the screen
                if (isNew) {
                    alert('Veículo salvo! Agora vincule ao menos um motorista na aba Usuários para concluir.');
                } else {
                    alert('Veículo salvo com sucesso!');
                }
            }
            return true;
        } catch (error: any) {
            console.error('Error saving vehicle:', error.message);
            if (!silent) alert('Erro ao salvar: ' + error.message);
            return false;
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleSave = async () => {
        const wasNew = isNew;
        const success = await performSave();

        // Only return to list if it's NOT a new vehicle being saved for the first time
        // Or if it's already an existing vehicle being updated
        if (success && !wasNew) {
            onBack();
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <FleetForm data={formData} onChange={handleFieldChange} />;
            case 'users':
                return <FleetUsers vehicleId={idForAssignments} onEnsureExists={() => performSave(true)} />;
            case 'checklists':
                return <FleetChecklists vehicleId={idForAssignments} onEnsureExists={() => performSave(true)} />;
            default:
                return <FleetForm data={formData} onChange={handleFieldChange} />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="px-8 py-5">
                    <div className="flex items-center gap-4 mb-1">
                        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-xl font-bold text-blue-900">
                            {isNew ? 'Novo Veículo' : formData.plate}
                        </h1>
                    </div>
                    <div className="text-xs text-slate-400 ml-10">
                        Frotas / {isNew ? 'Cadastrar Veículo' : 'Configurar Veículo'}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex px-8 gap-8">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`pb-4 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'profile' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        Dados Cadastrais
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-4 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'users' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        Usuários
                    </button>
                    <button
                        onClick={() => setActiveTab('checklists')}
                        className={`pb-4 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'checklists' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        Checklists
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {renderContent()}
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-slate-200 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700">Ativo</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={formData.active}
                            onChange={(e) => handleFieldChange('active', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-blue-900 text-white px-8 py-2.5 rounded text-sm font-bold shadow-sm hover:bg-blue-800 transition-colors disabled:opacity-50"
                >
                    {loading ? 'SALVANDO...' : 'SALVAR'}
                </button>
            </div>
        </div>
    );
};

export default FleetConfig;
