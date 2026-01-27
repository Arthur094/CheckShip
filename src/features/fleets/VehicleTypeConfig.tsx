
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import VehicleTypeForm from './VehicleTypeForm';
import VehicleTypeUnits from './VehicleTypeUnits';
import VehicleTypeChecklists from './VehicleTypeChecklists';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface VehicleTypeConfigProps {
    onBack: () => void;
    initialData?: any;
}

const VehicleTypeConfig: React.FC<VehicleTypeConfigProps> = ({ onBack, initialData }) => {
    const { user } = useAuth();
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        id: initialData?.id || null,
        name: initialData?.name || '',
        description: initialData?.description || ''
    });

    const isNew = !formData.id;

    useEffect(() => {
        if (initialData) {
            setFormData({
                id: initialData.id,
                name: initialData.name || '',
                description: initialData.description || ''
            });
        }
    }, [initialData]);

    useEffect(() => {
        if (user) {
            supabase
                .from('profiles')
                .select('company_id')
                .eq('id', user.id)
                .single()
                .then(({ data }) => {
                    if (data) setCompanyId(data.company_id);
                });
        }
    }, [user]);

    const handleFieldChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const performSave = async (silent = false): Promise<boolean> => {
        if (!formData.name.trim()) {
            if (!silent) alert('O nome do tipo de veículo é obrigatório.');
            return false;
        }

        try {
            if (!silent) setLoading(true);

            const payload = {
                id: formData.id || undefined,
                name: formData.name,
                description: formData.description,
                company_id: companyId
            };

            const { data, error } = await supabase
                .from('vehicle_types')
                .upsert(payload)
                .select()
                .single();

            if (error) throw error;

            if (data) {
                setFormData(prev => ({ ...prev, id: data.id }));
            }

            if (!silent) {
                alert('Tipo de veículo salvo com sucesso!');
                if (isNew) {
                    // Update current view to not new mode if staying, or if strict navigation, back.
                    // Here we originally went back.
                    onBack();
                }
            }
            return true;
        } catch (error: any) {
            console.error('Error saving vehicle type:', error.message);
            if (!silent) alert('Erro ao salvar: ' + error.message);
            return false;
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleSave = () => performSave(false);

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <VehicleTypeForm data={formData} onChange={handleFieldChange} />;
            case 'units':
                return <VehicleTypeUnits vehicleTypeId={formData.id} onEnsureExists={() => performSave(true)} />;
            case 'checklists':
                return <VehicleTypeChecklists vehicleTypeId={formData.id} onEnsureExists={() => performSave(true)} />;
            default:
                return <VehicleTypeForm data={formData} onChange={handleFieldChange} />;
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
                            {isNew ? 'Novo Tipo de Veículo' : formData.name}
                        </h1>
                    </div>
                    <div className="text-xs text-slate-400 ml-10">
                        Tipos de Veículos / {isNew ? 'Cadastrar Tipo' : 'Configurar Tipo'}
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
                        onClick={() => setActiveTab('units')}
                        className={`pb-4 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'units' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        Veículos
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
                        <input type="checkbox" className="sr-only peer" defaultChecked={true} />
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

export default VehicleTypeConfig;
