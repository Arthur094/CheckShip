import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { cacheService } from '../../services/cacheService';

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Carregando...');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setLoadingMessage('Autenticando...');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(`Erro de login: ${error.message}`);
        setLoading(false);
        return;
      }

      // Download data for offline use
      setLoadingMessage('Baixando dados para uso offline...');
      await cacheService.downloadAllData(data.user!.id, supabase);

      console.log('✅ Login completo - Cache populado');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erro no login:', error);
      alert('Erro ao fazer login: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-10 min-h-screen bg-background-light">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-primary">
            <span className="material-symbols-outlined text-5xl">local_shipping</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">CheckShip</h1>
            <p className="mt-2 text-sm text-slate-500">Professional Fleet Management</p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-slate-900 text-sm font-medium" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="user@checkship.com"
              className="form-input flex w-full rounded-lg border border-slate-200 bg-white h-14 px-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-900 text-sm font-medium" htmlFor="password">Password</label>
            <div className="relative flex w-full">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="form-input flex w-full rounded-lg rounded-r-none border border-r-0 border-slate-200 bg-white h-14 px-4"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div
                className="flex items-center justify-center px-4 rounded-r-lg border border-l-0 border-slate-200 bg-white cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-primary h-14 text-white font-bold"
          >
            {loading ? loadingMessage : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default LoginScreen;