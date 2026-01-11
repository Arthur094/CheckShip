import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vehicle } from '../../types/mobile';

const MOCK_VEHICLES: Vehicle[] = [
  { id: '1', plate: 'ABC-1B34', model: 'Volkswagen Delivery', type: 'Caminhão', location: 'Frota SP', status: 'available' },
  { id: '2', plate: 'XYZ-9876', model: 'Ford Transit', type: 'Van', location: 'Frota RJ', status: 'available' },
  { id: '3', plate: 'JGK-2910', model: 'Fiat Fiorino', type: 'Utilitário', location: 'Frota SP', status: 'available' },
  { id: '4', plate: 'BCA-5512', model: 'Mercedes-Benz Accelo', type: 'Caminhão Leve', location: 'Frota MG', status: 'available' },
  { id: '5', plate: 'ZZZ-0000', model: 'Scania R450', type: 'Carreta', location: 'Frota Sul', status: 'maintenance' },
];

const VehicleSelectScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVehicles = MOCK_VEHICLES.filter(v =>
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-background-light dark:bg-background-dark font-display antialiased text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="h-safe-top w-full"></div>
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate('/mobile/dashboard')}
            aria-label="Voltar"
            className="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-900 dark:text-white"
          >
            <span className="material-symbols-outlined text-[28px]">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold leading-tight tracking-tight text-center flex-1 text-slate-900 dark:text-white">
            Selecionar Veículo
          </h1>
          <button
            aria-label="Filtrar"
            className="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-primary"
          >
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pb-8 pt-2">
        {/* Search Bar */}
        <div className="py-4 sticky top-[60px] z-30 bg-background-light dark:bg-background-dark">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">search</span>
            </div>
            <input
              type="text"
              className="block w-full rounded-xl border-0 py-3.5 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary bg-surface-light dark:bg-surface-dark dark:ring-slate-700 dark:text-white sm:text-sm sm:leading-6 shadow-sm transition-shadow"
              placeholder="Buscar placa ou modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between pt-2 pb-4">
          <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
            Veículos Disponíveis
          </h3>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-full">
            {filteredVehicles.length}
          </span>
        </div>

        {/* Vehicle List */}
        <div className="space-y-3">
          {filteredVehicles.map((vehicle) => (
            <button
              key={vehicle.id}
              onClick={() => vehicle.status === 'available' && navigate(`/mobile/template-select/${vehicle.plate}`)}
              disabled={vehicle.status !== 'available'}
              className={`w-full group relative flex items-center gap-4 bg-surface-light dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all duration-200 text-left ${vehicle.status !== 'available' ? 'opacity-60 grayscale-[0.5] hover:opacity-100' : 'hover:border-primary/50 dark:hover:border-primary/50 active:scale-[0.99]'}`}
            >
              <div className={`flex shrink-0 items-center justify-center size-14 rounded-lg ${vehicle.status === 'maintenance' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-blue-50 dark:bg-blue-900/20 text-primary'}`}>
                <span className="material-symbols-outlined text-[28px]">
                  {vehicle.status === 'maintenance' ? 'construction' : 'local_shipping'}
                </span>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-slate-900 dark:text-white text-base font-bold leading-none truncate">
                    {vehicle.plate}
                  </p>
                  {vehicle.status === 'available' ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20">
                      Disponível
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-500 ring-1 ring-inset ring-amber-600/20">
                      Manutenção
                    </span>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-tight truncate mb-0.5">
                  {vehicle.model}
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-xs leading-tight">
                  {vehicle.type} • {vehicle.location}
                </p>
              </div>
              <div className="shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default VehicleSelectScreen;