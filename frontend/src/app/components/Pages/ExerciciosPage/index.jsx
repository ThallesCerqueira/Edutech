'use client';
import styles from "./index.module.css";
import { ModalUniversal } from "@/app/components/Modal";
import { SearchBar } from "@/app/components/SearchBars";
import { List } from "@/app/components";
import { useState, useEffect } from "react";

export default function ExerciciosPage() {
    const [modalAberto, setModalAberto] = useState(false);
    const [modalMode, setModalMode] = useState('view'); // 'view', 'form', 'confirm'
    const [modalType, setModalType] = useState(''); // 'new', 'edit', 'view', 'delete'
    const [exercicios, setExercicios] = useState([]);
    const [mapasDisponiveis, setMapasDisponiveis] = useState([]);
    const [exercicioSelecionado, setExercicioSelecionado] = useState(null);
    const [exerciciosFiltrados, setExerciciosFiltrados] = useState([]);
    const [termoBusca, setTermoBusca] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        carregarExercicios();
        carregarMapas();
    }, []);

    useEffect(() => {
        if (termoBusca === '') {
            setExerciciosFiltrados(exercicios);
        } else {
            const filtrados = exercicios.filter(exercicio =>
                exercicio.titulo.toLowerCase().includes(termoBusca.toLowerCase())
            );
            setExerciciosFiltrados(filtrados);
        }
    }, [exercicios, termoBusca]);

    // Função para carregar exercícios do backend
    const carregarExercicios = async () => {
        try {
            const response = await fetch('http://localhost:3001/exercicios');
            if (!response.ok) throw new Error('Erro ao carregar exercícios');

            const data = await response.json();
            setExercicios(data);
            setExerciciosFiltrados(data);
        } catch (error) {
            console.error('Erro ao carregar exercícios:', error);
        }
    };

    // Função para carregar mapas disponíveis
    const carregarMapas = async () => {
        try {
            const response = await fetch('http://localhost:3001/mapas');
            if (!response.ok) throw new Error('Erro ao carregar mapas');

            const data = await response.json();
            setMapasDisponiveis(data);
        } catch (error) {
            console.error('Erro ao carregar mapas:', error);
        }
    };

    // Handlers para abrir modais
    const abrirModalNovo = () => {
        setModalMode('form');
        setModalType('new');
        setExercicioSelecionado(null);
        setError('');
        setModalAberto(true);
    };

    const abrirModalVer = async (id) => {
        try {
            const response = await fetch(`http://localhost:3001/exercicios/${id}`);
            if (!response.ok) throw new Error('Erro ao carregar exercício');

            const data = await response.json();
            setExercicioSelecionado(data);
            setModalMode('view');
            setModalType('view');
            setError('');
            setModalAberto(true);
        } catch (error) {
            console.error('Erro ao carregar exercício:', error);
        }
    };

    const abrirModalEditar = async (id) => {
        try {
            const response = await fetch(`http://localhost:3001/exercicios/${id}`);
            if (!response.ok) throw new Error('Erro ao carregar exercício para edição');

            const data = await response.json();
            setExercicioSelecionado(data);
            setModalMode('form');
            setModalType('edit');
            setError('');
            setModalAberto(true);
        } catch (error) {
            console.error('Erro ao carregar exercício para edição:', error);
        }
    };

    const abrirModalExcluir = (exercicio) => {
        setExercicioSelecionado(exercicio);
        setModalMode('confirm');
        setModalType('delete');
        setError('');
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
        setModalMode('view');
        setModalType('');
        setExercicioSelecionado(null);
        setError('');
        setIsLoading(false);
    };

    // Handlers para ações
    const handleSubmitExercicio = async (formData) => {
        setIsLoading(true);
        setError('');

        try {
            // Validar se alternativas foram fornecidas
            if (!formData.alternativas || formData.alternativas.length === 0) {
                throw new Error('Adicione pelo menos uma alternativa para o exercício');
            }

            // Preparar dados conforme backend espera
            const dadosEnvio = {
                titulo: formData.titulo,
                enunciado: formData.enunciado,
                dificuldade: parseInt(formData.dificuldade),
                id_mapa: formData.id_mapa ? parseInt(formData.id_mapa) : null,
                alternativas: formData.alternativas.map((alt, index) => ({
                    descricao: alt.descricao,
                    correta: alt.correta || false
                }))
            };

            // Validar se pelo menos uma alternativa está marcada como correta
            const temCorreta = dadosEnvio.alternativas.some(alt => alt.correta);
            if (!temCorreta) {
                throw new Error('Marque pelo menos uma alternativa como correta');
            }

            const url = modalType === 'edit'
                ? `http://localhost:3001/exercicios/${exercicioSelecionado.id}`
                : 'http://localhost:3001/exercicios';

            const method = modalType === 'edit' ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosEnvio),
            });

            if (!response.ok) throw new Error('Erro ao salvar exercício');

            await carregarExercicios();
            fecharModal();
        } catch (error) {
            setError('Erro ao salvar exercício: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmExcluir = async () => {
        setIsLoading(true);

        try {
            const response = await fetch(`http://localhost:3001/exercicios/${exercicioSelecionado.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Erro ao excluir exercício');

            await carregarExercicios();
            fecharModal();
        } catch (error) {
            setError('Erro ao excluir exercício: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Configurações para diferentes modos do modal
    const getModalConfig = () => {
        const baseConfig = {
            isOpen: modalAberto,
            onClose: fecharModal,
            isLoading,
            error
        };

        switch (modalType) {
            case 'new':
                return {
                    ...baseConfig,
                    mode: 'form',
                    title: 'Novo Exercício',
                    formFields: [
                        {
                            key: 'titulo',
                            label: 'Título',
                            type: 'text',
                            required: true,
                            placeholder: 'Digite o título do exercício'
                        },
                        {
                            key: 'enunciado',
                            label: 'Enunciado',
                            type: 'textarea',
                            required: true,
                            rows: 4,
                            placeholder: 'Digite o enunciado do exercício'
                        },
                        {
                            key: 'dificuldade',
                            label: 'Dificuldade',
                            type: 'number',
                            required: true,
                            min: 1,
                            max: 10,
                            placeholder: 'Digite a dificuldade (1-10)'
                        },
                        {
                            key: 'id_mapa',
                            label: 'Mapa (Opcional)',
                            type: 'select',
                            required: false,
                            options: mapasDisponiveis.map(mapa => ({
                                value: mapa.id,
                                label: mapa.titulo
                            })),
                            placeholder: 'Selecione um mapa (opcional)'
                        },
                        {
                            key: 'alternativas',
                            label: 'Alternativas',
                            type: 'alternativas',
                            required: true,
                            help: 'Adicione as alternativas e marque a(s) correta(s)'
                        }
                    ],
                    initialFormData: {
                        alternativas: [
                            { descricao: '', correta: false },
                            { descricao: '', correta: false }
                        ]
                    },
                    onSubmit: handleSubmitExercicio,
                    submitText: 'Criar Exercício'
                };

            case 'edit':
                return {
                    ...baseConfig,
                    mode: 'form',
                    title: 'Editar Exercício',
                    formFields: [
                        {
                            key: 'titulo',
                            label: 'Título',
                            type: 'text',
                            required: true,
                            placeholder: 'Digite o título do exercício'
                        },
                        {
                            key: 'enunciado',
                            label: 'Enunciado',
                            type: 'textarea',
                            required: true,
                            rows: 4,
                            placeholder: 'Digite o enunciado do exercício'
                        },
                        {
                            key: 'dificuldade',
                            label: 'Dificuldade',
                            type: 'number',
                            required: true,
                            min: 1,
                            max: 10,
                            placeholder: 'Digite a dificuldade (1-10)'
                        },
                        {
                            key: 'id_mapa',
                            label: 'Mapa (Opcional)',
                            type: 'select',
                            required: false,
                            options: mapasDisponiveis.map(mapa => ({
                                value: mapa.id,
                                label: mapa.titulo
                            })),
                            placeholder: 'Selecione um mapa (opcional)'
                        },
                        {
                            key: 'alternativas',
                            label: 'Alternativas',
                            type: 'alternativas',
                            required: true,
                            help: 'Adicione as alternativas e marque a(s) correta(s)'
                        }
                    ],
                    initialFormData: exercicioSelecionado ? {
                        titulo: exercicioSelecionado.titulo || '',
                        enunciado: exercicioSelecionado.enunciado || '',
                        dificuldade: exercicioSelecionado.dificuldade || '',
                        id_mapa: exercicioSelecionado.id_mapa || '',
                        alternativas: exercicioSelecionado.alternativas || [
                            { descricao: '', correta: false },
                            { descricao: '', correta: false }
                        ]
                    } : {},
                    onSubmit: handleSubmitExercicio,
                    submitText: 'Salvar Alterações'
                };

            case 'view':
                return {
                    ...baseConfig,
                    mode: 'view',
                    title: 'Detalhes do Exercício',
                    data: exercicioSelecionado || {},
                    fields: [
                        {
                            key: 'titulo',
                            label: 'Título'
                        },
                        {
                            key: 'enunciado',
                            label: 'Enunciado'
                        },
                        {
                            key: 'dificuldade',
                            label: 'Dificuldade',
                            render: (value) => value ? `${value}/10` : '-'
                        },
                        {
                            key: 'id_mapa',
                            label: 'Mapa',
                            render: (value) => {
                                if (!value) return 'Nenhum mapa associado';
                                const mapa = mapasDisponiveis.find(m => m.id === value);
                                return mapa ? mapa.titulo : `Mapa ID: ${value}`;
                            }
                        },
                        {
                            key: 'alternativas',
                            label: 'Alternativas',
                            render: (value) => {
                                if (Array.isArray(value) && value.length > 0) {
                                    return (
                                        <div>
                                            {value.map((alt, index) => (
                                                <div key={index} style={{
                                                    marginBottom: '8px',
                                                    padding: '6px',
                                                    backgroundColor: alt.correta ? '#d4edda' : '#f8f9fa',
                                                    border: `1px solid ${alt.correta ? '#c3e6cb' : '#dee2e6'}`,
                                                    borderRadius: '4px'
                                                }}>
                                                    <strong>Alternativa {index + 1}:</strong> {alt.descricao}
                                                    {alt.correta && <span style={{ color: '#155724', fontWeight: 'bold' }}> ✓ (Correta)</span>}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                }
                                return 'Nenhuma alternativa cadastrada';
                            }
                        },
                        {
                            key: 'id',
                            label: 'ID'
                        }
                    ],
                    actions: [
                        {
                            label: 'Editar',
                            icon: 'fa-edit',
                            className: 'btns salvar',
                            onClick: () => {
                                fecharModal();
                                setTimeout(() => abrirModalEditar(exercicioSelecionado.id), 100);
                            }
                        }
                    ]
                };

            case 'delete':
                return {
                    ...baseConfig,
                    mode: 'confirm',
                    title: 'Confirmar Exclusão',
                    message: `Deseja realmente excluir o exercício "${exercicioSelecionado?.titulo}"? Esta ação não pode ser desfeita.`,
                    confirmText: 'Excluir',
                    confirmType: 'danger',
                    onConfirm: handleConfirmExcluir
                };

            default:
                return baseConfig;
        }
    };

    const onVer = abrirModalVer;
    const onEditar = abrirModalEditar;
    const onExcluir = (id) => {
        const exercicio = exercicios.find(ex => ex.id === id);
        if (exercicio) {
            abrirModalExcluir(exercicio);
        }
    };

    return (
        <>
            <div className={styles.mainContainer}>
                <h1>Exercícios</h1>

                <SearchBar
                    searchTerm={termoBusca}
                    onSearchChange={setTermoBusca}
                    onNew={abrirModalNovo}
                    placeholder="Buscar exercícios..."
                    buttonText="Novo Exercício"
                    buttonIcon="fa-plus"
                    showSearch={true}
                />

                <List
                    items={exerciciosFiltrados}
                    onVer={onVer}
                    onEditar={onEditar}
                    onExcluir={onExcluir}
                    type="exercicio"
                    emptyMessage="Nenhum exercício encontrado."
                    emptySubMessage="Crie seu primeiro exercício!"
                    emptyIcon="fa-solid fa-book"
                />
            </div>

            <ModalUniversal {...getModalConfig()} />
        </>
    );

}
