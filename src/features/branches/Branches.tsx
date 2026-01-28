
import React, { useState } from 'react';
import BranchList from './BranchList';
import BranchConfig from './BranchConfig';

const Branches: React.FC = () => {
    const [view, setView] = useState<'list' | 'config'>('list');
    const [selectedBranch, setSelectedBranch] = useState<any>(null);

    const handleNew = () => {
        setSelectedBranch(null);
        setView('config');
    };

    const handleEdit = (branch: any) => {
        setSelectedBranch(branch);
        setView('config');
    };

    const handleBack = () => {
        setView('list');
    };

    return (
        <div className="h-full bg-slate-50">
            {view === 'list' ? (
                <BranchList onNew={handleNew} onEdit={handleEdit} />
            ) : (
                <BranchConfig onBack={handleBack} initialData={selectedBranch} />
            )}
        </div>
    );
};

export default Branches;
