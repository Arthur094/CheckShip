
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

const UserForm: React.FC = () => {
    return (
        <div className="p-8">
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-6 border-b border-slate-100 pb-2">Identificação</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
                        <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all" />
                        <div className="text-right text-xs text-slate-400 mt-1">0 / 255</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Senha *</label>
                            <div className="relative">
                                <input type="password" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all" />
                                <Eye className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer" size={16} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar *</label>
                            <div className="relative">
                                <input type="password" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all" />
                                <Eye className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer" size={16} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">E-mail *</label>
                        <input type="email" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome de usuário *</label>
                        <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all" />
                        <p className="text-xs text-slate-400 mt-1">Exemplo: usuario_empresa</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Usuário *</label>
                        <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-slate-700">
                            <option>Selecione...</option>
                            <option>Administrador</option>
                            <option>Gestor</option>
                            <option>Operador</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Idioma *</label>
                            <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-slate-700">
                                <option>Português</option>
                                <option>English</option>
                                <option>Español</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                            <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all" />
                            <div className="text-right text-xs text-slate-400 mt-1">0 / 15</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">País *</label>
                            <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-slate-700">
                                <option>Brasil</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                            <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-slate-700">
                                <option>Selecione...</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Enviar credenciais *</label>
                        <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-slate-700">
                            <option>Não</option>
                            <option>Sim</option>
                        </select>
                        <p className="text-xs text-slate-400 mt-1">Envia os dados de acesso do usuário por e-mail</p>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Forçar alteração de senha *</label>
                    <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-slate-700">
                        <option>Sim</option>
                        <option>Não</option>
                    </select>
                    <p className="text-xs text-slate-400 mt-1">Obriga o usuário a alterar a senha em seu próximo acesso</p>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm mt-6">
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-6 border-b border-slate-100 pb-2">Campos Adicionais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Matrícula:</label>
                        <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Função:</label>
                        <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserForm;
