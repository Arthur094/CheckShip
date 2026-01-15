import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextData {
    user: User | null;
    session: Session | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialize session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        console.log('Attempting login with:', email);

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            console.error('Supabase Auth Error:', error);
            throw error;
        }

        console.log('Login successful, user:', data.user);

        if (data.user) {
            // Validate Profile (NON-BLOCKING for now)
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            console.log('Profile fetch result:', { profile, profileError });

            // TEMPORARIAMENTE: Apenas avisar, não bloquear
            if (profileError || !profile) {
                console.warn('⚠️ AVISO: Perfil não encontrado!', profileError);
                // NÃO BLOQUEAR: permitir login mesmo sem perfil para debug
            } else if (!profile.active) {
                console.warn('⚠️ AVISO: Perfil está inativo!');
                // NÃO BLOQUEAR: permitir login mesmo inativo para debug
            } else {
                console.log('✅ Perfil válido e ativo:', profile);
            }
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            loading,
            login,
            logout,
            isAuthenticated: !!user
        }
        }>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
