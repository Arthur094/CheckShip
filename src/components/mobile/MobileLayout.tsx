import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const MobileLayout: React.FC = () => {
    return (
        <div className="flex flex-col h-screen bg-slate-50">
            <main className="flex-1 overflow-y-auto pb-16">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
};

export default MobileLayout;
