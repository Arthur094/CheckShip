
import React, { useState } from 'react';
import AccessProfileList from './AccessProfileList';
import AccessProfileForm from './AccessProfileForm';

const AccessProfiles: React.FC = () => {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [selectedProfile, setSelectedProfile] = useState<any>(null);

    const handleNew = () => {
        setSelectedProfile(null);
        setView('form');
    };

    const handleEdit = (profile: any) => {
        setSelectedProfile(profile);
        setView('form');
    };

    const handleBack = () => {
        setView('list');
    };

    return (
        <div className="h-full bg-slate-50">
            {view === 'list' ? (
                <AccessProfileList onNew={handleNew} onEdit={handleEdit} />
            ) : (
                <AccessProfileForm onBack={handleBack} initialData={selectedProfile} />
            )}
        </div>
    );
};

export default AccessProfiles;
