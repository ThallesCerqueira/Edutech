'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading, usuario } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated()) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router, usuario]);

    // Mostra loading enquanto verifica autenticação
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px',
                color: '#666'
            }}>
                Carregando...
            </div>
        );
    }

    // Se não estiver autenticado, não renderiza nada (redirecionamento acontece no useEffect)
    if (!isAuthenticated()) {
        return null;
    }

    // Se estiver autenticado, renderiza o conteúdo
    return children;
};

export default ProtectedRoute;
