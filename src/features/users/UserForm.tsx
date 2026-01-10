
import React from 'react';

interface UserFormProps {
    data: any;
    onChange: (field: string, value: any) => void;
}

const UserForm: React.FC<UserFormProps> = ({ data, onChange }) => {
    return (
        <div className="p-8">
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-6 border-b border-slate-100 pb-2">Identificação do Usuário</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
                        <input
                            type="text"
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                            value={data.full_name || ''}
                            onChange={(e) => onChange('full_name', e.target.value)}
                            placeholder="Ex: João Silva"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">E-mail *</label>
                        <input
                            type="email"
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                            value={data.email || ''}
                            onChange={(e) => onChange('email', e.target.value)}
                            placeholder="email@exemplo.com"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Cargo *</label>
                        <select
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-slate-700"
                            value={data.role || ''}
                            onChange={(e) => onChange('role', e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            <option value="GESTOR">GESTOR</option>
                            <option value="MOTORISTA">MOTORISTA</option>
                            <option value="OPERADOR">OPERADOR</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Documento (CNH/CPF)</label>
                        <input
                            type="text"
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                            value={data.document || ''}
                            onChange={(e) => onChange('document', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                        <input
                            type="text"
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all"
                            value={data.phone || ''}
                            onChange={(e) => onChange('phone', e.target.value)}
                            placeholder="(00) 00000-0000"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-4 text-xs text-slate-400 px-1">
                * Campos obrigatórios. O ID do usuário será gerenciado automaticamente.
            </div>
        </div>
    );
};

export default UserForm;
