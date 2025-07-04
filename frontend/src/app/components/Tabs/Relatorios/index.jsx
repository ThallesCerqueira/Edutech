'use client';
import styles from "./index.module.css";
import { TabPageLayout } from "@/app/components/Layout";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";

export default function RelatoriosPage() {
    const { turmaSelecionada, usuario } = useAuth();
    const [relatorios, setRelatorios] = useState([]);

    useEffect(() => {
        carregarRelatorios();
    }, []);

    const carregarRelatorios = async () => {
        try {
            // Por enquanto, dados mockados para demonstração
            const dadosMock = [
                { id: 1, tipo: 'Exercícios Resolvidos', valor: 25, periodo: 'Última semana' },
                { id: 2, tipo: 'Mapas Utilizados', valor: 8, periodo: 'Último mês' },
                { id: 3, tipo: 'Listas Criadas', valor: 12, periodo: 'Último mês' },
            ];
            setRelatorios(dadosMock);
        } catch (error) {
            console.error('Erro ao carregar relatórios:', error);
        }
    }

    const handleGerarRelatorio = () => {
        // Implementar lógica para gerar relatório
        console.log('Gerar relatório personalizado');
    };

    return (
        <TabPageLayout
            title="Relatórios"
            icon="fa-chart-line"
            subtitle="Acompanhe métricas e progresso da turma"
            headerActions={
                turmaSelecionada && usuario?.tipo !== 'aluno' ? (
                    <button
                        className={styles.newButton}
                        onClick={handleGerarRelatorio}
                    >
                        <i className="fa-solid fa-chart-line"></i>
                        Gerar Relatório
                    </button>
                ) : null
            }
        >
            {!turmaSelecionada ? (
                <div className={styles.noTurma}>
                    <div className={styles.noTurmaContent}>
                        <i className="fa-solid fa-users" style={{ fontSize: '48px', color: '#6b7280', marginBottom: '16px' }}></i>
                        <h3>Nenhuma turma selecionada</h3>
                        <p>Selecione uma turma para visualizar relatórios específicos da turma.</p>
                    </div>
                </div>
            ) : usuario?.tipo === 'aluno' ? (
                <div className={styles.noPermission}>
                    <div className={styles.noPermissionContent}>
                        <i className="fa-solid fa-lock" style={{ fontSize: '48px', color: '#6b7280', marginBottom: '16px' }}></i>
                        <h3>Acesso Restrito</h3>
                        <p>Apenas professores e administradores podem acessar relatórios.</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className={styles.cardsContainer}>
                        {relatorios.map((relatorio) => (
                            <div key={relatorio.id} className={styles.reportCard}>
                                <div className={styles.reportInfo}>
                                    <h3 className={styles.reportTitle}>{relatorio.tipo}</h3>
                                    <p className={styles.reportPeriod}>{relatorio.periodo}</p>
                                </div>
                                <div className={styles.reportValue}>
                                    {relatorio.valor}
                                </div>
                            </div>
                        ))}
                    </div>

                    {relatorios.length === 0 && (
                        <div className={styles.emptyState}>
                            <i className="fa-solid fa-chart-line"></i>
                            <h3>Nenhum relatório disponível</h3>
                            <p>Os relatórios aparecerão aqui conforme os dados forem coletados.</p>
                        </div>
                    )}
                </>
            )}
        </TabPageLayout>
    );
}
