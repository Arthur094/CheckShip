import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
    AlertTriangle,
    Check,
    Trash2,
    Plus,
    Monitor,
    Smartphone,
    Globe,
    Info,
    AlertCircle,
    X
} from 'lucide-react';

export default function Announcements() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Form State
    const [message, setMessage] = useState('');
    const [type, setType] = useState('info'); // info, warning, error
    const [target, setTarget] = useState('all'); // all, web, mobile
    const [active, setActive] = useState(true);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('system_announcements')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setAnnouncements(data);
        }
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const { data: userData } = await supabase.auth.getUser();

        const { error } = await supabase.from('system_announcements').insert({
            message,
            type,
            target,
            active,
            created_by: userData.user?.id
        });

        if (error) {
            alert('Erro ao criar aviso: ' + error.message);
        } else {
            setShowForm(false);
            resetForm();
            fetchAnnouncements();
        }
        setProcessing(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este aviso?')) return;

        const { error } = await supabase.from('system_announcements').delete().eq('id', id);
        if (error) {
            alert('Erro ao excluir: ' + error.message);
        } else {
            fetchAnnouncements();
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('system_announcements')
            .update({ active: !currentStatus })
            .eq('id', id);

        if (!error) {
            fetchAnnouncements();
        }
    };

    const resetForm = () => {
        setMessage('');
        setType('info');
        setTarget('all');
        setActive(true);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Avisos do Sistema</h1>
                    <p className="text-slate-500">Gerencie mensagens globais para os usuários</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-800 transition-colors"
                >
                    <Plus size={18} />
                    Novo Aviso
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-bold text-slate-700">Mensagem</th>
                                <th className="px-6 py-4 font-bold text-slate-700">Tipo</th>
                                <th className="px-6 py-4 font-bold text-slate-700">Alvo</th>
                                <th className="px-6 py-4 font-bold text-slate-700">Status</th>
                                <th className="px-6 py-4 font-bold text-slate-700 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Carregando...</td></tr>
                            ) : announcements.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Nenhum aviso encontrado.</td></tr>
                            ) : (
                                announcements.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 max-w-md truncate" title={item.message}>
                                            {item.message}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${item.type === 'error' ? 'bg-red-100 text-red-700' :
                                                    item.type === 'warning' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-blue-100 text-blue-700'
                                                }`}>
                                                {item.type === 'error' && <AlertCircle size={12} />}
                                                {item.type === 'warning' && <AlertTriangle size={12} />}
                                                {item.type === 'info' && <Info size={12} />}
                                                {item.type === 'error' ? 'Erro' : item.type === 'warning' ? 'Aviso' : 'Info'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-slate-500">
                                                {item.target === 'all' && <><Globe size={14} /> Todos</>}
                                                {item.target === 'web' && <><Monitor size={14} /> Web</>}
                                                {item.target === 'mobile' && <><Smartphone size={14} /> Mobile</>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleActive(item.id, item.active)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${item.active ? 'bg-green-500' : 'bg-slate-200'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.active ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                                title="Excluir"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">Novo Aviso</h3>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mensagem</label>
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none h-24 text-sm font-medium"
                                    placeholder="Digite a mensagem do aviso..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
                                    <select
                                        value={type}
                                        onChange={e => setType(e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none"
                                    >
                                        <option value="info">Informação (Azul)</option>
                                        <option value="warning">Aviso (Amarelo)</option>
                                        <option value="error">Crítico (Vermelho)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Destino</label>
                                    <select
                                        value={target}
                                        onChange={e => setTarget(e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none"
                                    >
                                        <option value="all">Todos</option>
                                        <option value="web">Apenas Web</option>
                                        <option value="mobile">Apenas Mobile</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setActive(!active)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${active ? 'bg-green-500' : 'bg-slate-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                                <span className="text-sm font-bold text-slate-700">Ativo imediatamente</span>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-bold transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {processing ? 'Salvando...' : 'Publicar Aviso'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
