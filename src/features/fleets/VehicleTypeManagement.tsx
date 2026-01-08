
import React, { useState } from 'react';
import VehicleTypeList from './VehicleTypeList';
import VehicleTypeConfig from './VehicleTypeConfig';

const VehicleTypeManagement: React.FC = () => {
    const [view, setView] = useState<'list' | 'config'>('list');
    const [selectedType, setSelectedType] = useState<any>(null);

    const handleNew = () => {
        setSelectedType(null);
        setView('config');
    };

    const handleEdit = (vehicleType: any) => {
        setSelectedType(vehicleType);
        setView('config');
    };

    const handleBack = () => {
        setView('list');
        setSelectedType(null);
    };

    return (
        <div className="h-full">
            {view === 'list' ? (
                <VehicleTypeList onNew={handleNew} onEdit={handleEdit} />
            ) : (
                <VehicleTypeConfig onBack={handleBack} initialData={selectedType} />
            )}
        </div>
    );
};

export default VehicleTypeManagement;
