
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import TrailerForm from './TrailerForm';
import TrailerVehicles from './TrailerVehicles';
import DocumentTab from '../../components/common/DocumentTab';

interface TrailerConfigProps {
    onBack: () => void;
    initialData: any | null;
}

const TrailerConfig: React.FC<TrailerConfigProps> = ({ onBack, initialData }) => {
    const { user } = useAuth();
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        id: initialData?.id || null,
        plate: initialData?.plate || '',
        active: initialData?.active ?? true,
        trailer_type: initialData?.trailer_type || 'CARRETA',
        civ_date: initialData?.civ_date || null,
        civ_expiry: initialData?.civ_expiry || null,
        civ_file_url: initialData?.civ_file_url || null,
        cipp_date: initialData?.cipp_date || null,
        cipp_expiry: initialData?.cipp_expiry || null,
        cipp_file_url: initialData?.cipp_file_url || null,
        cvt_date: initialData?.cvt_date || null,
        cvt_expiry: initialData?.cvt_expiry || null,
        cvt_file_url: initialData?.cvt_file_url || null,
        crlv_date: initialData?.crlv_date || null,
        crlv_expiry: initialData?.crlv_expiry || null,
        crlv_file_url: initialData?.crlv_file_url || null
    });

    const isNew = !formData.id;

    useEffect(() => {
        const fetchCompany = async () => {
            if (!user) return;
            const { data } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
            if (data) setCompanyId(data.company_id);
        };
        fetchCompany();
    }, [user]);

    const handleFieldChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const performSave = async (silent = false): Promise<string | null> => {
        if (!formData.plate) {
            if (!silent) alert('A placa é obrigatória.');
            return null;
        }

        if (!companyId) {
            if (!silent) alert('Erro: Empresa não identificada.');
            return null;
        }

        try {
            if (!silent) setLoading(true);

            // Create payload and remove id if it's null (for new records)
            const payload: any = {
                ...formData,
                company_id: companyId,
                plate: formData.plate.toUpperCase()
            };

            if (!payload.id) {
                delete payload.id;
            }

            const { data, error } = await supabase
                .from('trailers')
                .upsert(payload)
                .select()
                .single();

            if (error) throw error;

            if (data) {
                setFormData(prev => ({ ...prev, id: data.id }));
                if (!silent) {
                    alert('Carreta salva com sucesso!');
                    onBack();
                }
                return data.id;
            }
            return null;
        } catch (error: any) {
            if (!silent) alert('Erro ao salvar: ' + error.message);
            return null;
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <TrailerForm data={formData} onChange={handleFieldChange} />;
            case 'vehicles':
                return <TrailerVehicles trailerId={formData.id} onEnsureExists={() => performSave(true)} />;
            case 'documents':
                const trailerDocs = formData.trailer_type === 'DOLLY'
                    ? ['CRLV', 'CIV', 'CIPP', 'AET_FEDERAL', 'AET_ESTADUAL']
                    : ['CRLV', 'CIV', 'CIPP', 'CVT', 'AET_FEDERAL', 'AET_ESTADUAL']; // Default CARRETA
                return <DocumentTab entityType="trailer" entityId={formData.id} requiredDocs={trailerDocs} onEnsureExists={() => performSave(true)} />;
            default:
                return <TrailerForm data={formData} onChange={handleFieldChange} />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="px-8 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">
                                {isNew ? 'Nova Carreta' : formData.plate}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-400 font-medium font-mono uppercase">
                                    Configuração / {isNew ? 'Criar Implemento' : 'Editar Implemento'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {!isNew && (
                            <button
                                onClick={() => handleFieldChange('active', !formData.active)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${formData.active
                                    ? 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
                                    : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                                    }`}
                            >
                                {formData.active ? 'ATIVO' : 'INATIVO'}
                            </button>
                        )}
                        <button
                            onClick={() => performSave()}
                            disabled={loading}
                            className="bg-blue-900 text-white px-8 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-800 transition-colors shadow-lg disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                <Save size={18} />
                            )}
                            SALVAR ALTERAÇÕES
                        </button>
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
                        onClick={() => setActiveTab('documents')}
                        className={`pb-4 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'documents' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        Documentos
                    </button>
                    <button
                        onClick={() => setActiveTab('vehicles')}
                        className={`pb-4 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'vehicles' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        Veículos (Cavalos)
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default TrailerConfig;
