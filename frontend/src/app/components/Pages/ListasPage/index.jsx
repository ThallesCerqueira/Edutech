'use client';
import styles from "./index.module.css";
import { ModalUniversal } from "@/app/components/Modal";
import { SearchBar } from "@/app/components/SearchBars";
import { UniversalList } from "@/app/components/Cards";
import { useState, useEffect } from "react";

export default function ListasPage() {
    const [listas, setListas] = useState([]);
    const [exerciciosDisponiveis, setExerciciosDisponiveis] = useState([]);
    const [modalAberto, setModalAberto] = useState(false);
    const [modalMode, setModalMode] = useState('view');
    const [modalType, setModalType] = useState('');
    const [listaSelecionada, setListaSelecionada] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        carregarListas();
        carregarExercicios();
    }, []);

    const carregarListas = async () => {
        try {
            const response = await fetch('http://localhost:3001/listas');
            if (!response.ok) throw new Error('Erro ao carregar listas');

            const data = await response.json();
            setListas(data);
        } catch (error) {
            console.error('Erro ao carregar listas:', error);
        }
    };

    const carregarExercicios = async () => {
        try {
            const response = await fetch('http://localhost:3001/exercicios');
            if (!response.ok) throw new Error('Erro ao carregar exercícios');

            const data = await response.json();
            setExerciciosDisponiveis(data);
        } catch (error) {
            console.error('Erro ao carregar exercícios:', error);
        }
    };

    // Handlers para modais
    const abrirModalNova = () => {
        setModalMode('form');
        setModalType('new');
        setListaSelecionada(null);
        setError('');
        setModalAberto(true);
    };

    const abrirModalVer = async (id) => {
        try {
            const response = await fetch(`http://localhost:3001/listas/${id}`);
            if (!response.ok) throw new Error('Erro ao carregar lista');

            const data = await response.json();
            setListaSelecionada(data);
            setModalMode('view');
            setModalType('view');
            setError('');
            setModalAberto(true);
        } catch (error) {
            console.error('Erro ao carregar lista:', error);
        }
    };

    const abrirModalEditar = async (id) => {
        try {
            const response = await fetch(`http://localhost:3001/listas/${id}`);
            if (!response.ok) throw new Error('Erro ao carregar lista para edição');

            const data = await response.json();
            setListaSelecionada(data);
            setModalMode('form');
            setModalType('edit');
            setError('');
            setModalAberto(true);
        } catch (error) {
            console.error('Erro ao carregar lista para edição:', error);
        }
    };

    const abrirModalExcluir = (lista) => {
        setListaSelecionada(lista);
        setModalMode('confirm');
        setModalType('delete');
        setError('');
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
        setModalMode('view');
        setModalType('');
        setListaSelecionada(null);
        setError('');
        setIsLoading(false);
    };

    // Handlers para ações
    const handleSubmitLista = async (formData) => {
        setIsLoading(true);
        setError('');

        try {
            // Validar se exercícios foram selecionados
            if (!formData.exercicios || formData.exercicios.length === 0) {
                throw new Error('Selecione pelo menos um exercício para a lista');
            }

            // Preparar dados para envio conforme backend espera
            const dadosEnvio = {
                titulo: formData.titulo,
                descricao: formData.descricao,
                exercicios: formData.exercicios.map(id => ({ id: parseInt(id) }))
            };

            const url = modalType === 'edit'
                ? `http://localhost:3001/listas/${listaSelecionada.id}`
                : 'http://localhost:3001/listas';

            const method = modalType === 'edit' ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosEnvio),
            });

            if (!response.ok) throw new Error('Erro ao salvar lista');

            await carregarListas();
            fecharModal();
        } catch (error) {
            setError('Erro ao salvar lista: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmExcluir = async () => {
        setIsLoading(true);

        try {
            const response = await fetch(`http://localhost:3001/listas/${listaSelecionada.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Erro ao excluir lista');

            await carregarListas();
            fecharModal();
        } catch (error) {
            setError('Erro ao excluir lista: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Configurações do modal baseadas no tipo
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
                    title: 'Nova Lista de Exercícios',
                    formFields: [
                        {
                            key: 'titulo',
                            label: 'Título',
                            type: 'text',
                            required: true,
                            placeholder: 'Digite o título da lista'
                        },
                        {
                            key: 'descricao',
                            label: 'Descrição',
                            type: 'textarea',
                            required: true,
                            rows: 4,
                            placeholder: 'Descreva a lista de exercícios'
                        },
                        {
                            key: 'exercicios',
                            label: 'Exercícios',
                            type: 'multiselect',
                            required: true,
                            options: exerciciosDisponiveis.map(ex => ({
                                value: ex.id,
                                label: `${ex.titulo} (Dificuldade: ${ex.dificuldade || 'N/A'})`
                            })),
                            placeholder: 'Selecione os exercícios para a lista'
                        }
                    ],
                    initialFormData: { exercicios: [] },
                    onSubmit: handleSubmitLista,
                    submitText: 'Criar Lista'
                };

            case 'edit':
                return {
                    ...baseConfig,
                    mode: 'form',
                    title: 'Editar Lista',
                    formFields: [
                        {
                            key: 'titulo',
                            label: 'Título',
                            type: 'text',
                            required: true,
                            placeholder: 'Digite o título da lista'
                        },
                        {
                            key: 'descricao',
                            label: 'Descrição',
                            type: 'textarea',
                            required: true,
                            rows: 4,
                            placeholder: 'Descreva a lista de exercícios'
                        },
                        {
                            key: 'exercicios',
                            label: 'Exercícios',
                            type: 'multiselect',
                            required: true,
                            options: exerciciosDisponiveis.map(ex => ({
                                value: ex.id,
                                label: `${ex.titulo} (Dificuldade: ${ex.dificuldade || 'N/A'})`
                            })),
                            placeholder: 'Selecione os exercícios para a lista'
                        }
                    ],
                    initialFormData: listaSelecionada ? {
                        titulo: listaSelecionada.titulo || '',
                        descricao: listaSelecionada.descricao || '',
                        exercicios: listaSelecionada.exercicios ? listaSelecionada.exercicios.map(ex => ex.id) : []
                    } : {},
                    onSubmit: handleSubmitLista,
                    submitText: 'Salvar Alterações'
                };

            case 'view':
                return {
                    ...baseConfig,
                    mode: 'view',
                    title: 'Detalhes da Lista',
                    data: listaSelecionada || {},
                    fields: [
                        {
                            key: 'titulo',
                            label: 'Título'
                        },
                        {
                            key: 'descricao',
                            label: 'Descrição'
                        },
                        {
                            key: 'exercicios',
                            label: 'Exercícios',
                            render: (value) => {
                                if (Array.isArray(value) && value.length > 0) {
                                    return (
                                        <div>
                                            <p><strong>{value.length} exercício(s):</strong></p>
                                            <ul style={{ marginLeft: '20px' }}>
                                                {value.map(ex => (
                                                    <li key={ex.id}>
                                                        {ex.titulo} (Dificuldade: {ex.dificuldade || 'N/A'})
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                }
                                return '0 exercícios';
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
                                setTimeout(() => abrirModalEditar(listaSelecionada.id), 100);
                            }
                        }
                    ]
                };

            case 'delete':
                return {
                    ...baseConfig,
                    mode: 'confirm',
                    title: 'Confirmar Exclusão',
                    message: `Deseja realmente excluir a lista "${listaSelecionada?.titulo}"? Esta ação não pode ser desfeita.`,
                    confirmText: 'Excluir',
                    confirmType: 'danger',
                    onConfirm: handleConfirmExcluir
                };

            default:
                return baseConfig;
        }
    };

    const handleNovaLista = abrirModalNova;
    const handleVerLista = abrirModalVer;
    const handleEditarLista = abrirModalEditar;
    const handleExcluirLista = (id) => {
        const lista = listas.find(l => l.id === id);
        if (lista) {
            abrirModalExcluir(lista);
        }
    };

    return (
        <>
            <div className={styles.mainContainer}>
                <h1>Listas de Exercícios</h1>

                <SearchBar
                    onNew={handleNovaLista}
                    buttonText="Nova Lista"
                    buttonIcon="fa-plus"
                    showSearch={false}
                />

                <UniversalList
                    items={listas}
                    onVer={handleVerLista}
                    onEditar={handleEditarLista}
                    onExcluir={handleExcluirLista}
                    type="lista"
                    emptyMessage="Nenhuma lista encontrada."
                    emptySubMessage="Crie sua primeira lista de exercícios!"
                    emptyIcon="fa-solid fa-list-check"
                />
            </div>

            <ModalUniversal {...getModalConfig()} />
        </>
    );
}
