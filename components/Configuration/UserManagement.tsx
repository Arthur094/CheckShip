
import React, { useState } from 'react';
import UserList from './UserList';
import UserConfig from './UserConfig';

const UserManagement: React.FC = () => {
    const [view, setView] = useState<'list' | 'config'>('list');
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const handleNew = () => {
        setSelectedUser(null);
        setView('config');
    };

    const handleEdit = (user: any) => {
        setSelectedUser(user);
        setView('config');
    };

    const handleBack = () => {
        setView('list');
        setSelectedUser(null);
    };

    return (
        <div className="h-full">
            {view === 'list' ? (
                <UserList onNew={handleNew} onEdit={handleEdit} />
            ) : (
                <UserConfig onBack={handleBack} initialData={selectedUser} />
            )}
        </div>
    );
};

export default UserManagement;
