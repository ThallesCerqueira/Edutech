'use client';
import styles from "./index.module.css";
import { useState, useEffect } from "react";

export default function RelatoriosPage() {
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

    return (
        <div className={styles.mainContainer}>
            <h1>Relatórios</h1>
            <div className={styles.searchContainer}>
                <button className={styles.newButton}>
                    Gerar Relatório <i className="fa-solid fa-chart-line" style={{ marginLeft: 5 }}></i>
                </button>
            </div>

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
                <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
                    Nenhum relatório disponível no momento.
                </p>
            )}
        </div>
    );
}
