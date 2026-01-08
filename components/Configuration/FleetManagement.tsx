
import React, { useState } from 'react';
import FleetList from './FleetList';
import FleetConfig from './FleetConfig';

const FleetManagement: React.FC = () => {
    const [view, setView] = useState<'list' | 'config'>('list');
    const [selectedFleet, setSelectedFleet] = useState<any>(null);

    const handleNew = () => {
        setSelectedFleet(null);
        setView('config');
    };

    const handleEdit = (fleet: any) => {
        setSelectedFleet(fleet);
        setView('config');
    };

    const handleBack = () => {
        setView('list');
        setSelectedFleet(null);
    };

    return (
        <div className="h-full">
            {view === 'list' ? (
                <FleetList onNew={handleNew} onEdit={handleEdit} />
            ) : (
                <FleetConfig onBack={handleBack} initialData={selectedFleet} />
            )}
        </div>
    );
};

export default FleetManagement;
