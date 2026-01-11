import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../BottomNav';
import type { Inspection } from '../../types';

const RECENT_INSPECTIONS: Inspection[] = [
  {
    id: '1',
    vehiclePlate: 'KJS-9281',
    vehicleModel: 'Volvo FH 540',
    status: 'progress',
    startedAt: 'Today',
    inspector: 'João',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '2',
    vehiclePlate: 'RTA-4412',
    vehicleModel: 'Scania R450',
    status: 'progress',
    startedAt: 'Today',
    inspector: 'João',
    image: 'https://images.unsplash.com/photo-1596613768254-629b3a0bd792?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '3',
    vehiclePlate: 'BMX-1029',
    vehicleModel: 'Mercedes Actros',
    status: 'progress',
    startedAt: 'Yesterday',
    inspector: 'João',
    image: 'https://images.unsplash.com/photo-1616432043562-3671ea2e5242?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '4',
    vehiclePlate: 'DAF-3001',
    vehicleModel: 'DAF XF 105',
    status: 'progress',
    startedAt: 'Yesterday',
    inspector: 'Carlos',
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '5',
    vehiclePlate: 'IVC-8812',
    vehicleModel: 'Iveco Stralis',
    status: 'progress',
    startedAt: 'Yesterday',
    inspector: 'Ana',
    image: 'https://images.unsplash.com/photo-1605218427306-6354db69e563?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '6',
    vehiclePlate: 'VWP-1122',
    vehicleModel: 'VW Meteor',
    status: 'progress',
    startedAt: '2 days ago',
    inspector: 'Pedro',
    image: 'https://images.unsplash.com/photo-1626847037657-fd3622613ce3?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '7',
    vehiclePlate: 'MBZ-9900',
    vehicleModel: 'Mercedes Axor',
    status: 'progress',
    startedAt: '2 days ago',
    inspector: 'João',
    image: 'https://images.unsplash.com/photo-1591768793355-74d04bb6608f?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '8',
    vehiclePlate: 'VOL-2231',
    vehicleModel: 'Volvo VM',
    status: 'progress',
    startedAt: '3 days ago',
    inspector: 'Carlos',
    image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '9',
    vehiclePlate: 'SCN-7744',
    vehicleModel: 'Scania P360',
    status: 'progress',
    startedAt: '3 days ago',
    inspector: 'Ana',
    image: 'https://images.unsplash.com/photo-1579532536935-619928decd08?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '10',
    vehiclePlate: 'FRD-5511',
    vehicleModel: 'Ford Cargo',
    status: 'progress',
    startedAt: '4 days ago',
    inspector: 'Pedro',
    image: 'https://images.unsplash.com/photo-1513828583688-c2917cc7941c?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '11',
    vehiclePlate: 'MAN-3388',
    vehicleModel: 'MAN TGX',
    status: 'progress',
    startedAt: '4 days ago',
    inspector: 'João',
    image: 'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '12',
    vehiclePlate: 'SIN-1100',
    vehicleModel: 'Sinotruk Howo',
    status: 'progress',
    startedAt: '5 days ago',
    inspector: 'Carlos',
    image: 'https://images.unsplash.com/photo-1507560461415-997cd00bfd45?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '13',
    vehiclePlate: 'ABC-1234',
    vehicleModel: 'Toyota Hilux',
    status: 'progress',
    startedAt: '5 days ago',
    inspector: 'Ana',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=200&auto=format&fit=crop'
  }
];

const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (showToast) {
      timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showToast]);

  const handleCardClick = () => {
    setShowToast(true);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate data fetching
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-background-light relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-6">
          <div className="bg-slate-900/90 dark:bg-white/90 backdrop-blur-sm text-white dark:text-slate-900 px-6 py-4 rounded-2xl shadow-2xl font-medium text-center text-sm transform transition-all animate-in fade-in zoom-in duration-200">
            Este Checklist já foi enviado
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary shrink-0">
            <span className="material-symbols-outlined material-symbols-filled text-2xl">directions_boat</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-display">CheckShip</h1>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
        >
          <span className={`material-symbols-outlined ${isRefreshing ? 'animate-spin' : ''}`}>refresh</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-4 pb-28 space-y-4 bg-background-light">
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Iniciados Recentes</h2>
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">{RECENT_INSPECTIONS.length} Ativos</span>
        </div>

        {RECENT_INSPECTIONS.map((inspection) => (
          <article
            key={inspection.id}
            onClick={handleCardClick}
            className="group relative flex items-center justify-between gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className="shrink-0 size-14 rounded-xl bg-slate-100 bg-cover bg-center"
                style={{ backgroundImage: `url(${inspection.image})` }}
              ></div>
              <div className="flex flex-col min-w-0">
                <h3 className="text-base font-bold text-slate-900 leading-tight font-display">{inspection.vehiclePlate}</h3>
                <p className="text-sm text-slate-500 font-normal truncate">{inspection.vehicleModel}</p>
                <div className="mt-1.5 flex">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-600">
                    <span className="size-1 rounded-full bg-blue-600"></span>
                    Em progresso
                  </span>
                </div>
              </div>
            </div>
            <div className="shrink-0 text-slate-200 group-hover:text-slate-400 transition-colors">
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </div>
          </article>
        ))}

        <div className="flex flex-col items-center justify-center py-10 opacity-60">
          <div className="text-slate-400 mb-2">
            <span className="material-symbols-outlined text-5xl">checklist</span>
          </div>
          <p className="text-slate-400 text-sm">Fim da lista</p>
        </div>
      </main>

      {/* FAB - Animated Pill Style */}
      <div className="fixed bottom-24 right-6 z-30 group">
        <button
          onClick={() => navigate('/vehicles')}
          className="flex items-center justify-center h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-xl px-4 transition-all duration-300"
        >
          <div className="max-w-0 overflow-hidden group-hover:max-w-[150px] group-hover:mr-2 transition-[max-width,margin] duration-300 whitespace-nowrap">
            <span className="text-sm font-bold">Iniciar Inspeção</span>
          </div>
          <span className="material-symbols-outlined text-[28px]">add</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default DashboardScreen;