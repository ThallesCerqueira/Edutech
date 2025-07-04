'use client';
import { TabPageLayout } from "@/app/components/Layout";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import styles from "./index.module.css";

export default function ResolverExercicioPage({ exercicioId, exercicio: exercicioProp, onVoltar }) {
    const { usuario } = useAuth();
    const [exercicio, setExercicio] = useState(null);
    const [mapa, setMapa] = useState(null);
    const [alternativasSelecionadas, setAlternativasSelecionadas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (exercicioProp) {
            // Se o exercício foi passado como prop, usar ele diretamente
            const exercicioParaAluno = {
                ...exercicioProp,
                alternativas: exercicioProp.alternativas.map(alt => ({
                    id: alt.id,
                    descricao: alt.descricao
                    // Não incluir a propriedade 'correta'
                }))
            };
            setExercicio(exercicioParaAluno);
            if (exercicioProp.id_mapa) {
                carregarMapa(exercicioProp.id_mapa);
            } else {
                setIsLoading(false);
            }
        } else if (exercicioId) {
            carregarExercicio();
        }
    }, [exercicioId, exercicioProp]);

    const carregarMapa = async (mapaId) => {
        try {
            const token = localStorage.getItem('token');
            const mapaResponse = await fetch(`http://localhost:3001/mapas/${mapaId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (mapaResponse.ok) {
                const mapaData = await mapaResponse.json();
                setMapa(mapaData);
            }
        } catch (error) {
            console.error('Erro ao carregar mapa:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const carregarExercicio = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');

            // Carregar dados do exercício
            const response = await fetch(`http://localhost:3001/exercicios/${exercicioId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Erro ao carregar exercício');

            const exercicioData = await response.json();

            // Remover a informação de quais alternativas são corretas para o aluno
            const exercicioParaAluno = {
                ...exercicioData,
                alternativas: exercicioData.alternativas.map(alt => ({
                    id: alt.id,
                    descricao: alt.descricao
                    // Não incluir a propriedade 'correta'
                }))
            };

            setExercicio(exercicioParaAluno);

            // Carregar mapa se existir
            if (exercicioData.id_mapa) {
                await carregarMapa(exercicioData.id_mapa);
            } else {
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Erro ao carregar exercício:', error);
            setError('Erro ao carregar exercício: ' + error.message);
            setIsLoading(false);
        }
    };

    const handleSelecionarAlternativa = (alternativaId) => {
        setAlternativasSelecionadas(prev => {
            if (prev.includes(alternativaId)) {
                // Se já está selecionada, remove
                return prev.filter(id => id !== alternativaId);
            } else {
                // Se não está selecionada, adiciona
                return [...prev, alternativaId];
            }
        });
    };

    const handleConfirmarResposta = () => {
        if (alternativasSelecionadas.length === 0) {
            alert('Por favor, selecione pelo menos uma alternativa antes de confirmar.');
            return;
        }

        // Por enquanto, apenas mostra um alert
        const quantidade = alternativasSelecionadas.length;
        const mensagem = quantidade === 1
            ? 'Resposta registrada! (Funcionalidade de salvamento será implementada em breve)'
            : `${quantidade} alternativas registradas! (Funcionalidade de salvamento será implementada em breve)`;

        alert(mensagem);

        // Volta para a listagem
        onVoltar();
    };

    if (isLoading) {
        return (
            <TabPageLayout
                title="Carregando Exercício..."
                icon="fa-spinner"
                subtitle="Aguarde um momento"
            >
                <div className={styles.loading}>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <p>Carregando exercício...</p>
                </div>
            </TabPageLayout>
        );
    }

    if (error) {
        return (
            <TabPageLayout
                title="Erro"
                icon="fa-exclamation-triangle"
                subtitle="Ocorreu um problema"
            >
                <div className={styles.error}>
                    <i className="fa-solid fa-exclamation-triangle"></i>
                    <p>{error}</p>
                    <button className={styles.voltarButton} onClick={onVoltar}>
                        <i className="fa-solid fa-arrow-left"></i>
                        Voltar às Listas
                    </button>
                </div>
            </TabPageLayout>
        );
    }

    if (!exercicio) {
        return (
            <TabPageLayout
                title="Exercício não encontrado"
                icon="fa-question"
                subtitle="O exercício solicitado não foi encontrado"
            >
                <div className={styles.notFound}>
                    <i className="fa-solid fa-question"></i>
                    <p>O exercício solicitado não foi encontrado.</p>
                    <button className={styles.voltarButton} onClick={onVoltar}>
                        <i className="fa-solid fa-arrow-left"></i>
                        Voltar às Listas
                    </button>
                </div>
            </TabPageLayout>
        );
    }

    return (
        <TabPageLayout
            title={exercicio.titulo}
            icon="fa-file-pen"
            subtitle={`Resolva o exercício selecionando uma ou mais alternativas (${alternativasSelecionadas.length} selecionada${alternativasSelecionadas.length !== 1 ? 's' : ''})`}
        >
            <div className={styles.resolverContainer}>
                {/* Botão de voltar */}
                <div className={styles.header}>
                    <button className={styles.voltarButton} onClick={onVoltar}>
                        <i className="fa-solid fa-arrow-left"></i>
                        Voltar às Listas
                    </button>
                    <div className={styles.exercicioInfo}>
                        <span className={styles.dificuldade}>
                            Dificuldade: {exercicio.dificuldade}/10
                        </span>
                    </div>
                </div>

                <div className={styles.exercicioContent}>
                    {/* Mapa do exercício */}
                    {mapa && (
                        <div className={styles.mapaSection}>
                            <h3>Mapa do Exercício</h3>
                            <div className={styles.mapaContainer}>
                                {mapa.caminho ? (
                                    <img
                                        src={mapa.caminho}
                                        alt={mapa.titulo}
                                        className={styles.mapaImage}
                                    />
                                ) : (
                                    <div className={styles.mapaPlaceholder}>
                                        <i className="fa-solid fa-map"></i>
                                        <p>Mapa: {mapa.titulo}</p>
                                        {mapa.descricao && <p>{mapa.descricao}</p>}
                                    </div>
                                )}
                                {mapa.dica && (
                                    <div className={styles.mapaDica}>
                                        <i className="fa-solid fa-lightbulb"></i>
                                        <strong>Dica:</strong> {mapa.dica}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Enunciado do exercício */}
                    <div className={styles.enunciadoSection}>
                        <h3>Enunciado</h3>
                        <div className={styles.enunciado}>
                            {exercicio.enunciado}
                        </div>
                    </div>

                    {/* Alternativas */}
                    <div className={styles.alternativasSection}>
                        <div className={styles.alternativasHeader}>
                            <h3>Alternativas</h3>
                            <div className={styles.multiplaEscolhaInfo}>
                                <i className="fa-solid fa-info-circle"></i>
                                <span>Você pode selecionar uma ou mais alternativas</span>
                            </div>
                        </div>
                        <div className={styles.alternativas}>
                            {exercicio.alternativas.map((alternativa, index) => (
                                <div
                                    key={alternativa.id}
                                    className={`${styles.alternativa} ${alternativasSelecionadas.includes(alternativa.id) ? styles.selecionada : ''
                                        }`}
                                    onClick={() => handleSelecionarAlternativa(alternativa.id)}
                                >
                                    <div className={styles.alternativaCheckbox}>
                                        <input
                                            type="checkbox"
                                            name="alternativas"
                                            value={alternativa.id}
                                            checked={alternativasSelecionadas.includes(alternativa.id)}
                                            onChange={() => handleSelecionarAlternativa(alternativa.id)}
                                        />
                                    </div>
                                    <div className={styles.alternativaContent}>
                                        <span className={styles.alternativaLabel}>
                                            {String.fromCharCode(65 + index)})
                                        </span>
                                        <span className={styles.alternativaTexto}>
                                            {alternativa.descricao}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Botões de ação */}
                    <div className={styles.actions}>
                        <button
                            className={styles.voltarButton}
                            onClick={onVoltar}
                        >
                            <i className="fa-solid fa-arrow-left"></i>
                            Voltar para Exercícios
                        </button>
                        <button
                            className={styles.confirmarButton}
                            onClick={handleConfirmarResposta}
                            disabled={alternativasSelecionadas.length === 0}
                        >
                            <i className="fa-solid fa-check"></i>
                            Confirmar Resposta
                        </button>
                    </div>
                </div>
            </div>
        </TabPageLayout>
    );
}
