
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, no validation, just redirect
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded w-full max-w-[400px] p-8 shadow-lg">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-blue-900 p-1 rounded-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-700">CHECKSHIP</span>
          </div>
        </div>

        <h2 className="text-blue-900 text-xl font-medium mb-6">Fazer Login</h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <input
              type="text"
              placeholder="E-mail ou nome de usuário*"
              className="w-full bg-gray-100 border-none rounded p-3 text-sm focus:ring-1 focus:ring-blue-900 outline-none placeholder-gray-500 text-gray-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Senha*"
              className="w-full bg-gray-100 border-none rounded p-3 text-sm focus:ring-1 focus:ring-blue-900 outline-none placeholder-gray-500 text-gray-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded transition-colors uppercase text-sm mt-2"
          >
            Continuar
          </button>

          <div className="text-center mt-2">
            <a href="#" className="text-blue-400 text-sm hover:underline">
              Esqueceu sua senha?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
