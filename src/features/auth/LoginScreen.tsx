import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      try {
        await login(email, password);
        navigate('/dashboard'); // Adjusted path based on App.tsx routes
      } catch (error: any) {
        alert(error.message || 'Erro ao realizar login');
      }
    }
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-10 sm:px-10 min-h-screen bg-background-light dark:bg-background-dark">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo & Branding */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary">
            <span className="material-symbols-outlined text-5xl">local_shipping</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              CheckShip
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Professional Fleet Management
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                placeholder="user@checkship.com"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary h-14 placeholder:text-slate-400 px-4 text-base font-normal leading-normal transition-all duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal" htmlFor="password">
                Password
              </label>
            </div>
            <div className="relative flex w-full items-stretch rounded-lg">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-r-none border border-r-0 border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary h-14 placeholder:text-slate-400 px-4 text-base font-normal leading-normal transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div
                className="flex items-center justify-center px-4 rounded-r-lg border border-l-0 border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="button" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary h-14 px-4 text-base font-bold leading-normal text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-200"
          >
            Entrar
          </button>
        </form>
      </div>
      <footer className="py-6 text-center mt-auto">
        <p className="text-xs text-slate-400 dark:text-slate-600">
          Version 1.0.2
        </p>
      </footer>
    </main>
  );
};

export default LoginScreen;