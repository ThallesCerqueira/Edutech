'use client';
import { useState, useEffect } from 'react';
import styles from './index.module.css';

export default function SystemStatus() {
    const [backendStatus, setBackendStatus] = useState('checking'); // 'checking', 'online', 'offline'
    const [lastCheck, setLastCheck] = useState(null);

    const checkBackendStatus = async () => {
        try {
            const response = await fetch('http://localhost:3001/health', {
                method: 'GET',
                signal: AbortSignal.timeout(5000) // Timeout de 5 segundos
            });

            if (response.ok) {
                setBackendStatus('online');
            } else {
                setBackendStatus('offline');
            }
        } catch (error) {
            console.warn('Backend não está respondendo:', error.message);
            setBackendStatus('offline');
        }
        setLastCheck(new Date());
    };

    useEffect(() => {
        checkBackendStatus();

        // Verificar status a cada 30 segundos
        const interval = setInterval(checkBackendStatus, 30000);

        return () => clearInterval(interval);
    }, []);

    const getStatusInfo = () => {
        switch (backendStatus) {
            case 'checking':
                return {
                    icon: 'fa-spinner fa-spin',
                    text: 'Verificando conexão...',
                    className: styles.checking
                };
            case 'online':
                return {
                    icon: 'fa-check-circle',
                    text: 'Sistema online',
                    className: styles.online
                };
            case 'offline':
                return {
                    icon: 'fa-exclamation-triangle',
                    text: 'Backend desconectado',
                    className: styles.offline
                };
            default:
                return {
                    icon: 'fa-question-circle',
                    text: 'Status desconhecido',
                    className: styles.unknown
                };
        }
    };

    const statusInfo = getStatusInfo();

    // Só mostrar se houver problema ou estiver verificando
    if (backendStatus === 'online') {
        return null;
    }

    return (
        <div className={`${styles.statusBanner} ${statusInfo.className}`}>
            <div className={styles.statusContent}>
                <i className={`fa-solid ${statusInfo.icon}`}></i>
                <span>{statusInfo.text}</span>
                {backendStatus === 'offline' && (
                    <button
                        className={styles.retryButton}
                        onClick={checkBackendStatus}
                        title="Tentar novamente"
                    >
                        <i className="fa-solid fa-refresh"></i>
                        Tentar novamente
                    </button>
                )}
            </div>
            {backendStatus === 'offline' && (
                <div className={styles.helpText}>
                    Execute o comando: <code>./start-dev.sh</code> na pasta raiz do projeto
                </div>
            )}
        </div>
    );
}
