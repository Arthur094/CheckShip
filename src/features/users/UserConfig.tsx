
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import UserForm from './UserForm';
import UserVehicles from './UserVehicles';
import UserChecklists from './UserChecklists';

interface UserConfigProps {
    onBack: () => void;
    initialData?: any;
}

const UserConfig: React.FC<UserConfigProps> = ({ onBack, initialData }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const isNew = !initialData;

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <UserForm />;
            case 'vehicles':
                return <UserVehicles />;
            case 'checklists':
                return <UserChecklists />;
            default:
                return <UserForm />;
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
                            {isNew ? 'Novo Usuário' : initialData.name}
                        </h1>
                    </div>
                    <div className="text-xs text-slate-400 ml-10">
                        Usuários / {isNew ? 'Cadastrar Usuário' : 'Configurar Usuário'}
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
                        <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                </div>
                <button className="bg-blue-900 text-white px-8 py-2.5 rounded text-sm font-bold shadow-sm hover:bg-blue-800 transition-colors">
                    SALVAR
                </button>
            </div>
        </div>
    );
};

export default UserConfig;
