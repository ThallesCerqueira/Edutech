'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import styles from './index.module.css';

export default function ModalSelecaoTurma({ isOpen, onTurmaSelected }) {
    const { usuario, selecionarTurma } = useAuth();
    const [turmas, setTurmas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showJoinForm, setShowJoinForm] = useState(false);

    // Estados para criar turma
    const [nomeTurma, setNomeTurma] = useState('');

    // Estados para entrar na turma
    const [codigoConvite, setCodigoConvite] = useState('');

    useEffect(() => {
        if (isOpen && usuario) {
            carregarTurmas();
        }
    }, [isOpen, usuario]);

    const carregarTurmas = async () => {
        try {
            setLoading(true);
            setError(''); // Limpar erros anteriores

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token de autenticação não encontrado. Faça login novamente.');
            }

            // Verificar conectividade primeiro
            try {
                const healthCheck = await fetch('http://localhost:3001/health', {
                    method: 'GET',
                    signal: AbortSignal.timeout(3000) // 3 segundos de timeout
                });

                if (!healthCheck.ok) {
                    throw new Error('Backend não está respondendo');
                }
            } catch (connectError) {
                throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 3001.');
            }

            const response = await fetch('http://localhost:3001/turmas/usuario/minhas', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                signal: AbortSignal.timeout(10000) // 10 segundos de timeout
            });

            if (!response.ok) {
                let errorMessage = 'Erro ao carregar turmas';

                try {
                    const errorData = await response.json();
                    errorMessage = errorData.mensagem || errorMessage;
                } catch (parseError) {
                    // Se não conseguir parsear a resposta, usar mensagens padrão
                    if (response.status === 401) {
                        errorMessage = 'Sessão expirada. Faça login novamente.';
                    } else if (response.status === 404) {
                        errorMessage = 'Endpoint de turmas não encontrado. Verifique se o backend está atualizado.';
                    } else if (response.status === 500) {
                        errorMessage = 'Erro interno do servidor. Tente novamente em alguns instantes.';
                    } else {
                        errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
                    }
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();
            setTurmas(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erro ao carregar turmas:', error);

            // Mensagens de erro mais específicas
            let errorMessage = error.message;

            if (error.name === 'AbortError' || error.name === 'TimeoutError') {
                errorMessage = 'Timeout: Servidor demorou muito para responder. Tente novamente.';
            } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMessage = 'Erro de rede: Verifique sua conexão com a internet e se o backend está rodando.';
            }

            setError(errorMessage);
            setTurmas([]); // Garantir que turmas seja um array vazio em caso de erro
        } finally {
            setLoading(false);
        }
    };

    const criarTurma = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/turmas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nome: nomeTurma })
            });

            if (!response.ok) throw new Error('Erro ao criar turma');

            const data = await response.json();
            alert(`Turma criada com sucesso!\nCódigo de convite: ${data.codigo_convite}`);

            setNomeTurma('');
            setShowCreateForm(false);
            await carregarTurmas();
        } catch (error) {
            console.error('Erro ao criar turma:', error);
            setError('Erro ao criar turma');
        } finally {
            setLoading(false);
        }
    };

    const entrarNaTurma = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/turmas/entrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ codigo_convite: codigoConvite })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.mensagem || 'Erro ao entrar na turma');
                return;
            }

            alert(data.mensagem);
            setCodigoConvite('');
            setShowJoinForm(false);
            await carregarTurmas();
        } catch (error) {
            console.error('Erro ao entrar na turma:', error);
            setError('Erro ao entrar na turma');
        } finally {
            setLoading(false);
        }
    };

    const selecionarTurmaLocal = (turma) => {
        selecionarTurma(turma);
        localStorage.setItem('turmaSelecionada', JSON.stringify(turma));
        onTurmaSelected(turma);
    };

    const copiarCodigoConvite = (codigo) => {
        navigator.clipboard.writeText(codigo);
        alert('Código copiado para a área de transferência!');
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>Selecionar Turma</h2>
                    <p>Escolha uma turma para continuar ou crie/entre em uma nova</p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.content}>
                    {loading ? (
                        <div className={styles.loading}>Carregando...</div>
                    ) : turmas.length > 0 ? (
                        <div className={styles.turmasGrid}>
                            {turmas.map((turma) => (
                                <div key={turma.id} className={styles.turmaCard}>
                                    <div className={styles.turmaInfo}>
                                        <h3>{turma.nome}</h3>
                                        <div className={styles.stats}>
                                            <span>👥 {turma.total_alunos} alunos</span>
                                            <span>👨‍🏫 {turma.total_professores} professores</span>
                                        </div>
                                        {usuario?.tipo === 'professor' && (
                                            <div className={styles.codigoConvite}>
                                                <span>Código: {turma.codigo_convite}</span>
                                                <button
                                                    onClick={() => copiarCodigoConvite(turma.codigo_convite)}
                                                    className={styles.copyButton}
                                                    title="Copiar código"
                                                >
                                                    📋
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => selecionarTurmaLocal(turma)}
                                        className={styles.selectButton}
                                    >
                                        Selecionar
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noTurmas}>
                            <p>Você não está em nenhuma turma ainda.</p>
                            <p>
                                {usuario?.tipo === 'professor'
                                    ? 'Crie uma nova turma para começar.'
                                    : 'Use um código de convite para entrar em uma turma.'
                                }
                            </p>
                        </div>
                    )}
                </div>

                <div className={styles.actions}>
                    {usuario?.tipo === 'professor' && (
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className={styles.actionButton}
                            disabled={loading}
                        >
                            {showCreateForm ? 'Cancelar' : '+ Criar Turma'}
                        </button>
                    )}

                    {usuario?.tipo === 'aluno' && (
                        <button
                            onClick={() => setShowJoinForm(!showJoinForm)}
                            className={styles.actionButton}
                            disabled={loading}
                        >
                            {showJoinForm ? 'Cancelar' : '🔗 Entrar na Turma'}
                        </button>
                    )}
                </div>

                {showCreateForm && (
                    <form onSubmit={criarTurma} className={styles.form}>
                        <h3>Criar Nova Turma</h3>
                        <input
                            type="text"
                            placeholder="Nome da turma"
                            value={nomeTurma}
                            onChange={(e) => setNomeTurma(e.target.value)}
                            required
                            disabled={loading}
                        />
                        <div className={styles.formActions}>
                            <button type="submit" disabled={loading || !nomeTurma.trim()}>
                                {loading ? 'Criando...' : 'Criar Turma'}
                            </button>
                        </div>
                    </form>
                )}

                {showJoinForm && (
                    <form onSubmit={entrarNaTurma} className={styles.form}>
                        <h3>Entrar na Turma</h3>
                        <input
                            type="text"
                            placeholder="Código de convite (ex: ABC123XY)"
                            value={codigoConvite}
                            onChange={(e) => setCodigoConvite(e.target.value.toUpperCase())}
                            required
                            disabled={loading}
                            maxLength={8}
                        />
                        <div className={styles.formActions}>
                            <button type="submit" disabled={loading || !codigoConvite.trim()}>
                                {loading ? 'Entrando...' : 'Entrar na Turma'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
