'use client';
import { useState, useEffect } from 'react';
import styles from './ExercicioSelector.module.css';

export default function ExercicioSelector({ 
    exerciciosDisponiveis = [], 
    exerciciosSelecionados = [], 
    onChange,
    disabled = false 
}) {
    const [filtro, setFiltro] = useState('');
    const [selecionados, setSelecionados] = useState(exerciciosSelecionados);

    useEffect(() => {
        setSelecionados(exerciciosSelecionados);
    }, [exerciciosSelecionados]);

    const exerciciosFiltrados = exerciciosDisponiveis.filter(exercicio =>
        exercicio.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
        exercicio.enunciado?.toLowerCase().includes(filtro.toLowerCase())
    );

    const toggleExercicio = (exercicioId) => {
        if (disabled) return;
        
        const novaSeleção = selecionados.includes(exercicioId)
            ? selecionados.filter(id => id !== exercicioId)
            : [...selecionados, exercicioId];
        
        setSelecionados(novaSeleção);
        if (onChange) {
            onChange(novaSeleção);
        }
    };

    const selecionarTodos = () => {
        if (disabled) return;
        const todosIds = exerciciosFiltrados.map(ex => ex.id);
        setSelecionados(todosIds);
        if (onChange) {
            onChange(todosIds);
        }
    };

    const limparSelecao = () => {
        if (disabled) return;
        setSelecionados([]);
        if (onChange) {
            onChange([]);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Buscar exercícios por título ou enunciado..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        className={styles.searchInput}
                        disabled={disabled}
                    />
                    {filtro && (
                        <button
                            type="button"
                            onClick={() => setFiltro('')}
                            className={styles.clearSearch}
                            title="Limpar busca"
                        >
                            <i className="fa-solid fa-times"></i>
                        </button>
                    )}
                </div>
                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={selecionarTodos}
                        className={styles.actionButton}
                        disabled={disabled || exerciciosFiltrados.length === 0}
                        title={`Selecionar todos os ${exerciciosFiltrados.length} exercícios${filtro ? ' filtrados' : ''}`}
                    >
                        <i className="fa-solid fa-check-double"></i>
                        Selecionar Todos
                    </button>
                    <button
                        type="button"
                        onClick={limparSelecao}
                        className={styles.actionButton}
                        disabled={disabled || selecionados.length === 0}
                        title="Remover todos os exercícios selecionados"
                    >
                        <i className="fa-solid fa-times"></i>
                        Limpar
                    </button>
                </div>
            </div>

            <div className={styles.contador}>
                <i className="fa-solid fa-list-check" style={{ marginRight: '8px', color: '#3b82f6' }}></i>
                <strong>{selecionados.length}</strong> de <strong>{exerciciosDisponiveis.length}</strong> exercícios selecionados
                {filtro && exerciciosFiltrados.length !== exerciciosDisponiveis.length && (
                    <span className={styles.filtroInfo}>
                        (mostrando {exerciciosFiltrados.length} exercícios)
                    </span>
                )}
            </div>

            <div className={styles.listaExercicios}>
                {exerciciosFiltrados.length === 0 ? (
                    <div className={styles.semResultados}>
                        {filtro ? 'Nenhum exercício encontrado com este filtro.' : 'Nenhum exercício disponível.'}
                    </div>
                ) : (
                    exerciciosFiltrados.map((exercicio) => (
                        <div
                            key={exercicio.id}
                            className={`${styles.exercicioItem} ${
                                selecionados.includes(exercicio.id) ? styles.selecionado : ''
                            } ${disabled ? styles.disabled : ''}`}
                            onClick={() => toggleExercicio(exercicio.id)}
                        >
                            <div className={styles.checkbox}>
                                <input
                                    type="checkbox"
                                    checked={selecionados.includes(exercicio.id)}
                                    onChange={() => toggleExercicio(exercicio.id)}
                                    disabled={disabled}
                                />
                            </div>
                            <div className={styles.exercicioInfo}>
                                <h4>{exercicio.titulo}</h4>
                                <p>{exercicio.enunciado}</p>
                                <div className={styles.metadados}>
                                    <span className={styles.dificuldade}>
                                        <i className="fa-solid fa-signal" style={{ marginRight: '4px' }}></i>
                                        Dificuldade: {exercicio.dificuldade || 'N/A'}
                                    </span>
                                    {exercicio.id_mapa && (
                                        <span className={styles.mapa}>
                                            <i className="fa-solid fa-map" style={{ marginRight: '4px' }}></i>
                                            Com mapa
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
