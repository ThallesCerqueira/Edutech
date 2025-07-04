'use client';
import { TabPageLayout } from "@/app/components/Layout";
import { SearchBar } from "@/app/components/SearchBars";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import styles from "./index.module.css";

export default function TurmaPage() {
    const { turmaSelecionada, usuario } = useAuth();
    const [professores, setProfessores] = useState([]);
    const [alunos, setAlunos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [termoBusca, setTermoBusca] = useState('');

    // Verificar se o usuário pode editar (admin)
    const podeEditar = usuario?.tipo === 'admin';

    useEffect(() => {
        if (turmaSelecionada) {
            carregarMembros();
        }
    }, [turmaSelecionada]);

    const carregarMembros = async () => {
        try {
            setIsLoading(true);
            setError('');

            const token = localStorage.getItem('token');

            // Carregar professores da turma
            const professorResponse = await fetch(`http://localhost:3001/turmas/${turmaSelecionada.id}/professores`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Carregar alunos da turma
            const alunoResponse = await fetch(`http://localhost:3001/turmas/${turmaSelecionada.id}/alunos`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (professorResponse.ok) {
                const professorData = await professorResponse.json();
                setProfessores(professorData);
            } else {
                console.warn('Erro ao carregar professores:', professorResponse.status);
                setProfessores([]);
            }

            if (alunoResponse.ok) {
                const alunoData = await alunoResponse.json();
                setAlunos(alunoData);
            } else {
                console.warn('Erro ao carregar alunos:', alunoResponse.status);
                setAlunos([]);
            }

        } catch (error) {
            console.error('Erro ao carregar membros da turma:', error);
            setError('Erro ao carregar membros da turma: ' + error.message);
            setProfessores([]);
            setAlunos([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Filtrar membros pela busca
    const professoresFiltrados = professores.filter(professor =>
        professor.nome?.toLowerCase().includes(termoBusca.toLowerCase()) ||
        professor.email?.toLowerCase().includes(termoBusca.toLowerCase())
    );

    const alunosFiltrados = alunos.filter(aluno =>
        aluno.nome?.toLowerCase().includes(termoBusca.toLowerCase()) ||
        aluno.email?.toLowerCase().includes(termoBusca.toLowerCase())
    );

    const renderMembro = (membro, tipo) => (
        <div key={membro.id} className={styles.membroCard}>
            <div className={styles.membroAvatar}>
                <i className={`fa-solid ${tipo === 'professor' ? 'fa-chalkboard-teacher' : 'fa-user-graduate'}`}></i>
            </div>
            <div className={styles.membroInfo}>
                <h4 className={styles.membroNome}>{membro.nome}</h4>
                <p className={styles.membroEmail}>{membro.email}</p>
                <div className={styles.membroMeta}>
                    <span className={`${styles.tipoLabel} ${styles[tipo]}`}>
                        <i className={`fa-solid ${tipo === 'professor' ? 'fa-chalkboard-teacher' : 'fa-user-graduate'}`}></i>
                        {tipo === 'professor' ? 'Professor' : 'Aluno'}
                    </span>
                    {membro.data_entrada && (
                        <span className={styles.dataEntrada}>
                            <i className="fa-solid fa-calendar"></i>
                            Desde {new Date(membro.data_entrada).toLocaleDateString('pt-BR')}
                        </span>
                    )}
                </div>
            </div>
            {podeEditar && (
                <div className={styles.membroActions}>
                    <button
                        className={styles.actionButton}
                        title="Remover da turma"
                    >
                        <i className="fa-solid fa-user-minus"></i>
                    </button>
                </div>
            )}
        </div>
    );

    if (isLoading) {
        return (
            <TabPageLayout
                title="Membros da Turma"
                icon="fa-users"
                subtitle="Carregando..."
            >
                <div className={styles.loading}>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <p>Carregando membros da turma...</p>
                </div>
            </TabPageLayout>
        );
    }

    return (
        <TabPageLayout
            title="Membros da Turma"
            icon="fa-users"
            subtitle={turmaSelecionada ? `Professores e alunos da turma ${turmaSelecionada.nome}` : "Nenhuma turma selecionada"}
        >
            {!turmaSelecionada ? (
                <div className={styles.emptyState}>
                    <i className="fa-solid fa-users"></i>
                    <h3>Nenhuma turma selecionada</h3>
                    <p>Selecione uma turma para visualizar seus membros.</p>
                </div>
            ) : (
                <>
                    <SearchBar
                        searchTerm={termoBusca}
                        onSearchChange={setTermoBusca}
                        placeholder="Buscar por nome ou email..."
                        showSearch={true}
                        showButton={false}
                    />

                    {error && (
                        <div className={styles.error}>
                            <i className="fa-solid fa-exclamation-triangle"></i>
                            <p>{error}</p>
                        </div>
                    )}

                    <div className={styles.turmaContainer}>
                        {/* Seção de Professores */}
                        <div className={styles.secao}>
                            <div className={styles.secaoHeader}>
                                <h3>
                                    <i className="fa-solid fa-chalkboard-teacher"></i>
                                    Professores ({professoresFiltrados.length})
                                </h3>
                                {podeEditar && (
                                    <button className={styles.addButton}>
                                        <i className="fa-solid fa-user-plus"></i>
                                        Adicionar Professor
                                    </button>
                                )}
                            </div>

                            <div className={styles.membrosGrid}>
                                {professoresFiltrados.length === 0 ? (
                                    <div className={styles.emptySection}>
                                        <i className="fa-solid fa-chalkboard-teacher"></i>
                                        <p>Nenhum professor encontrado</p>
                                    </div>
                                ) : (
                                    professoresFiltrados.map(professor => renderMembro(professor, 'professor'))
                                )}
                            </div>
                        </div>

                        {/* Seção de Alunos */}
                        <div className={styles.secao}>
                            <div className={styles.secaoHeader}>
                                <h3>
                                    <i className="fa-solid fa-user-graduate"></i>
                                    Alunos ({alunosFiltrados.length})
                                </h3>
                                {podeEditar && (
                                    <button className={styles.addButton}>
                                        <i className="fa-solid fa-user-plus"></i>
                                        Adicionar Aluno
                                    </button>
                                )}
                            </div>

                            <div className={styles.membrosGrid}>
                                {alunosFiltrados.length === 0 ? (
                                    <div className={styles.emptySection}>
                                        <i className="fa-solid fa-user-graduate"></i>
                                        <p>Nenhum aluno encontrado</p>
                                    </div>
                                ) : (
                                    alunosFiltrados.map(aluno => renderMembro(aluno, 'aluno'))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Resumo da turma */}
                    <div className={styles.resumoTurma}>
                        <div className={styles.resumoCard}>
                            <i className="fa-solid fa-users"></i>
                            <div>
                                <h4>Total de Membros</h4>
                                <p>{professores.length + alunos.length}</p>
                            </div>
                        </div>
                        <div className={styles.resumoCard}>
                            <i className="fa-solid fa-chalkboard-teacher"></i>
                            <div>
                                <h4>Professores</h4>
                                <p>{professores.length}</p>
                            </div>
                        </div>
                        <div className={styles.resumoCard}>
                            <i className="fa-solid fa-user-graduate"></i>
                            <div>
                                <h4>Alunos</h4>
                                <p>{alunos.length}</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </TabPageLayout>
    );
}
