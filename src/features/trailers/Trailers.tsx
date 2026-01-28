
import React, { useState } from 'react';
import TrailerList from './TrailerList';
import TrailerConfig from './TrailerConfig';

const Trailers: React.FC = () => {
    const [view, setView] = useState<'list' | 'config'>('list');
    const [selectedTrailer, setSelectedTrailer] = useState<any | null>(null);

    const handleNew = () => {
        setSelectedTrailer(null);
        setView('config');
    };

    const handleEdit = (trailer: any) => {
        setSelectedTrailer(trailer);
        setView('config');
    };

    const handleBack = () => {
        setView('list');
        setSelectedTrailer(null);
    };

    if (view === 'config') {
        return <TrailerConfig onBack={handleBack} initialData={selectedTrailer} />;
    }

    return <TrailerList onNew={handleNew} onEdit={handleEdit} />;
};

export default Trailers;
