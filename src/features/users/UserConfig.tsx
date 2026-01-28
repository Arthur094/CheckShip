
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import UserForm from './UserForm';
import UserVehicles from './UserVehicles';
import UserChecklists from './UserChecklists';
import DocumentTab from '../../components/common/DocumentTab';
import { supabase, getCompanyId } from '../../lib/supabase';

interface UserConfigProps {
    onBack: () => void;
    initialData?: any;
}

const UserConfig: React.FC<UserConfigProps> = ({ onBack, initialData }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [accessProfiles, setAccessProfiles] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        id: initialData?.id || null,
        full_name: initialData?.full_name || '',
        email: initialData?.email || '',
        role: initialData?.role || '',
        document: initialData?.document || '',
        phone: initialData?.phone || '',
        active: initialData?.active !== undefined ? initialData.active : true,
        // New fields
        password: '',
        confirmPassword: '',
        showPassword: false,
        showConfirmPassword: false,
        force_password_change: initialData?.force_password_change || false,
        access_profile_id: initialData?.access_profile_id || '',
        accessProfiles: [] as any[] // Pass down to form
    });

    // Fetch Access Profiles
    useEffect(() => {
        const fetchProfiles = async () => {
            const { data, error } = await supabase
                .from('access_profiles')
                .select('*')
                .order('name');

            if (!error && data) {
                setAccessProfiles(data);
                setFormData(prev => ({ ...prev, accessProfiles: data }));
            }
        };
        fetchProfiles();
    }, []);

    const isNew = !formData.id;

    useEffect(() => {
        if (initialData) {
            setFormData({
                id: initialData.id,
                full_name: initialData.full_name || '',
                email: initialData.email || '',
                role: initialData.role || '',
                document: initialData.document || '',
                phone: initialData.phone || '',
                active: initialData.active !== undefined ? initialData.active : true,
                password: '',
                confirmPassword: '',
                showPassword: false,
                showConfirmPassword: false,
                force_password_change: initialData.force_password_change || false,
                access_profile_id: initialData.access_profile_id || '',
                accessProfiles: accessProfiles
            });
        }
    }, [initialData]);

    const handleFieldChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const performSave = async (silent = false): Promise<string | null> => {
        // Validation
        if (!formData.full_name.trim() || !formData.email.trim() || (!formData.role && !formData.access_profile_id)) {
            if (!silent) alert('Nome, E-mail e Perfil de Acesso são obrigatórios.');
            return null;
        }

        if (isNew) {
            if (!formData.password) {
                if (!silent) alert('Senha é obrigatória para novos usuários.');
                return null;
            }
            if (formData.password !== formData.confirmPassword) {
                if (!silent) alert('As senhas não coincidem.');
                return null;
            }
        } else {
            if (formData.password && formData.password !== formData.confirmPassword) {
                if (!silent) alert('As senhas não coincidem.');
                return null;
            }
        }

        try {
            if (!silent) setLoading(true);

            if (isNew) {
                // Get fresh session
                const { data: { session } } = await supabase.auth.getSession();

                if (!session?.access_token) {
                    throw new Error('Sessão expirada. Faça login novamente.');
                }

                // CREATE USER via Edge Function
                // Buscar company_id do subdomínio atual
                const companyId = await getCompanyId();

                const { data, error } = await supabase.functions.invoke('admin-create-user', {
                    body: {
                        email: formData.email,
                        password: formData.password,
                        full_name: formData.full_name,
                        role: formData.role, // Legacy compatibility
                        access_profile_id: formData.access_profile_id,
                        document: formData.document,
                        phone: formData.phone,
                        force_password_change: formData.force_password_change,
                        active: formData.active,
                        company_id: companyId
                    },
                    headers: {
                        Authorization: `Bearer ${session.access_token}`
                    }
                });

                if (error) throw error;
                if (!silent) alert('Usuário criado com sucesso!');

                // Update state with the new ID
                const newId = data?.user_id || null;
                if (newId) {
                    setFormData(prev => ({ ...prev, id: newId }));
                }

                return newId;

            } else {
                // UPDATE EXISTING USER

                // 1. Update Profile Data (Direct DB update for non-auth fields)
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        full_name: formData.full_name,
                        role: formData.role || null,
                        access_profile_id: formData.access_profile_id || null,
                        document: formData.document,
                        phone: formData.phone,
                        force_password_change: formData.force_password_change,
                        // active is updated via list usually, but can be here too? keeping it safe
                        active: formData.active,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', formData.id);

                if (profileError) throw profileError;

                // 2. Update Password/Email via Edge Function (if changed)
                if (formData.password) {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session?.access_token) throw new Error('Sessão inválida');

                    const { error: authError } = await supabase.functions.invoke('admin-update-user', {
                        body: {
                            user_id: formData.id,
                            password: formData.password
                        },
                        headers: {
                            Authorization: `Bearer ${session.access_token}`
                        }
                    });
                    if (authError) throw authError;
                }

                if (!silent) alert('Usuário atualizado com sucesso!');
                return formData.id;
            }
        } catch (error: any) {
            console.error('Error saving user FULL:', error);
            console.log('Error details:', JSON.stringify(error, null, 2));
            if (error && error.context) {
                error.context.json().then((json: any) => {
                    console.log('Error Body JSON:', json);
                    alert('Erro Backend: ' + (json.error || json.message || 'Sem detalhes'));
                }).catch(() => {
                    alert('Erro ao salvar: ' + (error.message || 'Erro desconhecido'));
                });
            } else {
                alert('Erro ao salvar: ' + (error.message || 'Erro desconhecido'));
            }
            return null;
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleSave = async () => {
        const success = await performSave();
        if (success) onBack();
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <UserForm data={formData} onChange={handleFieldChange} />;
            case 'vehicles':
                return <UserVehicles profileId={formData.id} onEnsureExists={() => performSave(true)} />;
            case 'checklists':
                return <UserChecklists profileId={formData.id} onEnsureExists={() => performSave(true)} />;
            case 'documents':
                return <DocumentTab entityType="driver" entityId={formData.id} requiredDocs={['CNH', 'NR_35', 'NR_20', 'MOPP', 'ASO']} onEnsureExists={() => performSave(true)} />;
            default:
                return <UserForm data={formData} onChange={handleFieldChange} />;
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
                            {isNew ? 'Novo Usuário' : formData.full_name}
                        </h1>
                    </div>
                    <div className="text-xs text-slate-400 ml-10">
                        Usuários / {isNew ? 'Cadastrar Usuário' : 'Configurar Usuário'}
                    </div>
                </div>

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

export default UserConfig;
