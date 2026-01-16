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
          {/* Custom Logo: Ship with Checklist (SVG) */}
          <div className="relative flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-blue-50 rounded-full scale-125 opacity-50 blur-xl"></div>
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 drop-shadow-xl">
              {/* Ship Body (Deep Blue) */}
              <path d="M20 21C18.61 21 17.22 20.53 16 19.68C13.56 21.39 10.44 21.39 8 19.68C6.78 20.53 5.39 21 4 21H2V23H4C5.38 23 6.74 22.65 8 22.01C10.52 23.3 13.48 23.3 16 22.01C17.26 22.66 18.62 23 20 23H22V21H20ZM3.95 19H4C5.6 19 7.02 18.12 8 17C8.98 18.12 10.4 19 12 19C13.6 19 15.02 18.12 16 17C16.98 18.12 18.4 19 20 19H20.05L21.94 12.32C22.02 12.06 22 11.78 21.88 11.54C21.76 11.3 21.5 11.15 21.24 11.15H2.72C2.46 11.15 2.22 11.3 2.1 11.54C1.98 11.78 1.97 12.06 2.05 12.32L3.95 19Z" fill="#1e3a8a" /> {/* slate-900 / dark blue */}

              {/* Ship Cabin/Upper Structure (Lighter Blue) */}
              <path d="M6 6V11H18V6C18 4.9 17.1 4 16 4H12V3H8V4H6V5H6V6Z" fill="#3b82f6" /> {/* blue-500 */}

              {/* Checklist overlaid (White bg + Green details) */}
              <g transform="translate(13, 2) scale(0.45)">
                {/* Clipboard background */}
                <path d="M19 3H14.82C14.4 1.84 13.3 1 12 1C10.7 1 9.6 1.84 9.18 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" fill="white" stroke="#0ea5e9" strokeWidth="2" />
                {/* Clip */}
                <path d="M12 1C12.55 1 13 1.45 13 2C13 2.55 12.55 3 12 3C11.45 3 11 2.55 11 2C11 1.45 11.45 1 12 1Z" fill="#0ea5e9" />
                {/* Checks */}
                <path d="M7 7H17" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                <path d="M7 11H17" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                <path d="M7 15H13" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                {/* Checkmark Badge */}
                <circle cx="16" cy="16" r="5" fill="#10b981" />
                <path d="M13.5 16L15 17.5L18.5 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </svg>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">CheckShip</h1>
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