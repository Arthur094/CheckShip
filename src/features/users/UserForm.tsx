
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

                {/* Password Fields - Only for new users or if editing password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="relative">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Senha {data.id ? '(Deixe em branco para manter)' : '*'}</label>
                        <div className="relative">
                            <input
                                type={data.showPassword ? "text" : "password"}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all pr-10"
                                value={data.password || ''}
                                onChange={(e) => onChange('password', e.target.value)}
                                placeholder={data.id ? "Alterar senha..." : "Defina a senha"}
                            />
                            <button
                                type="button"
                                onClick={() => onChange('showPassword', !data.showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {data.showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Senha {data.id ? '' : '*'}</label>
                        <div className="relative">
                            <input
                                type={data.showConfirmPassword ? "text" : "password"}
                                className={`w-full p-2.5 bg-slate-50 border rounded-lg focus:ring-1 outline-none transition-all pr-10 ${data.password && data.confirmPassword && data.password !== data.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-900 focus:border-blue-900'
                                    }`}
                                value={data.confirmPassword || ''}
                                onChange={(e) => onChange('confirmPassword', e.target.value)}
                                placeholder="Repita a senha"
                            />
                            <button
                                type="button"
                                onClick={() => onChange('showConfirmPassword', !data.showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {data.showConfirmPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                )}
                            </button>
                        </div>
                        {data.password && data.confirmPassword && data.password !== data.confirmPassword && (
                            <p className="text-xs text-red-500 mt-1">As senhas não coincidem.</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Perfil de Acesso *</label>
                        <select
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-slate-700"
                            value={data.access_profile_id || data.role || ''}
                            onChange={(e) => {
                                // Find selected profile
                                const selectedProfile = data.accessProfiles?.find((p: any) => p.id === e.target.value);
                                onChange('access_profile_id', e.target.value);
                                if (selectedProfile) onChange('role', selectedProfile.name);
                            }}
                        >
                            <option value="">Selecione...</option>
                            {data.accessProfiles?.map((profile: any) => (
                                <option key={profile.id} value={profile.id}>{profile.name}</option>
                            ))}
                            {/* Fallback options if no profiles loaded */}
                            {!data.accessProfiles?.length && (
                                <>
                                    <option value="GESTOR">GESTOR (Legado)</option>
                                    <option value="MOTORISTA">MOTORISTA (Legado)</option>
                                    <option value="OPERADOR">OPERADOR (Legado)</option>
                                </>
                            )}
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

                <div className="mb-2">
                    <label className="relative inline-flex items-center cursor-pointer gap-3">
                        <input
                            type="checkbox"
                            checked={data.force_password_change || false}
                            onChange={(e) => onChange('force_password_change', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-sm text-slate-700 font-medium">Forçar alteração de senha no próximo login</span>
                    </label>
                </div>
            </div>

            <div className="mt-4 text-xs text-slate-400 px-1">
                * Campos obrigatórios. O ID do usuário será gerenciado automaticamente.
            </div>
        </div>
    );
};

export default UserForm;
