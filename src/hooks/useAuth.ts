import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
    const navigate = useNavigate();
    const isAuthenticated = !!localStorage.getItem('checkship_auth');

    const login = () => {
        localStorage.setItem('checkship_auth', 'true');
        // Navigate logic is handled in LoginScreen usually, or here if preferred
    };

    const logout = () => {
        localStorage.removeItem('checkship_auth');
        navigate('/mobile/login');
    };

    return { login, logout, isAuthenticated };
};
