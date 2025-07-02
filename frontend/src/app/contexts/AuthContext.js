'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Verificar se há dados de usuário salvos
        try {
            const tokenSalvo = localStorage.getItem('token');
            const usuarioSalvo = localStorage.getItem('usuario');

            if (tokenSalvo && usuarioSalvo) {
                const usuarioData = JSON.parse(usuarioSalvo);
                setToken(tokenSalvo);
                setUsuario(usuarioData);
            }
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            // Limpar dados corrompidos sem chamar logout (evita loop)
            setUsuario(null);
            setToken(null);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
            }
        }

        setLoading(false);
    }, [mounted]); const login = (dadosUsuario, tokenUsuario) => {
        setUsuario(dadosUsuario);
        setToken(tokenUsuario);

        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('token', tokenUsuario);
                localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
            } catch (error) {
                console.error('Erro ao salvar no localStorage:', error);
            }
        }
    };

    const logout = () => {
        setUsuario(null);
        setToken(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
        }
        router.push('/login');
    };

    const isAuthenticated = () => {
        return !!token && !!usuario;
    };

    const value = {
        usuario,
        token,
        loading: loading || !mounted,
        login,
        logout,
        isAuthenticated
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
