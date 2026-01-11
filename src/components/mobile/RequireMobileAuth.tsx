import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const RequireMobileAuth: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect them to the /mobile/login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience.
        return <Navigate to="/mobile/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default RequireMobileAuth;
