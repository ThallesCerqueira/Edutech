'use client';
import { TabPageLayout } from "@/app/components/Layout";
import { ModalUniversal } from "@/app/components/Modal";
import { SearchBar } from "@/app/components/SearchBars";
import { ResolverExercicioPage } from "@/app/components/Tabs";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import styles from "./index.module.css";

export default function ListasExerciciosPage() {
  const { turmaSelecionada, usuario } = useAuth();
  const [listas, setListas] = useState([]);
  const [exerciciosPorLista, setExerciciosPorLista] = useState({});
  const [listasExpandidas, setListasExpandidas] = useState({});
  const [mapasDisponiveis, setMapasDisponiveis] = useState([]);

  // Verificar se o usuário pode editar (admin ou professor)
  const podeEditar = usuario?.tipo === 'admin' || usuario?.tipo === 'professor';

  // Estados para modais de lista
  const [modalListaAberto, setModalListaAberto] = useState(false);
  const [modalListaMode, setModalListaMode] = useState('view');
  const [modalListaType, setModalListaType] = useState('');
  const [listaSelecionada, setListaSelecionada] = useState(null);

  // Estados para modais de exercício
  const [modalExercicioAberto, setModalExercicioAberto] = useState(false);
  const [modalExercicioMode, setModalExercicioMode] = useState('view');
  const [modalExercicioType, setModalExercicioType] = useState('');
  const [exercicioSelecionado, setExercicioSelecionado] = useState(null);
  const [listaParaNovoExercicio, setListaParaNovoExercicio] = useState(null);

  // Estado para navegação para resolução de exercício
  const [mostraResolverExercicio, setMostraResolverExercicio] = useState(false);
  const [exercicioParaResolver, setExercicioParaResolver] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [termoBusca, setTermoBusca] = useState('');

  useEffect(() => {
    if (turmaSelecionada) {
      carregarListas();
      carregarMapas();
    }
  }, [turmaSelecionada]);

  const carregarListas = async () => {
    try {
      if (!turmaSelecionada?.id) {
        console.warn('Turma não selecionada');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/listas?id_turma=${turmaSelecionada.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Erro ao carregar listas');

      const data = await response.json();
      setListas(data);

      // Carregar exercícios para cada lista
      for (const lista of data) {
        carregarExerciciosDaLista(lista.id);
      }
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
      setListas([]);
    }
  };

  const carregarExerciciosDaLista = async (listaId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/listas/${listaId}/exercicios`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Erro ao carregar exercícios da lista');

      const data = await response.json();
      setExerciciosPorLista(prev => ({
        ...prev,
        [listaId]: data
      }));
    } catch (error) {
      console.error('Erro ao carregar exercícios da lista:', error);
      setExerciciosPorLista(prev => ({
        ...prev,
        [listaId]: []
      }));
    }
  };

  const carregarMapas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/mapas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Erro ao carregar mapas');

      const data = await response.json();
      setMapasDisponiveis(data);
    } catch (error) {
      console.error('Erro ao carregar mapas:', error);
      setMapasDisponiveis([]);
    }
  };

  // Função para expandir/contrair lista
  const toggleLista = (listaId) => {
    setListasExpandidas(prev => ({
      ...prev,
      [listaId]: !prev[listaId]
    }));
  };

  // Handlers para modais de lista
  const abrirModalNovaLista = () => {
    setModalListaMode('form');
    setModalListaType('new');
    setListaSelecionada(null);
    setError('');
    setModalListaAberto(true);
  };

  const abrirModalEditarLista = (lista) => {
    setListaSelecionada(lista);
    setModalListaMode('form');
    setModalListaType('edit');
    setError('');
    setModalListaAberto(true);
  };

  const abrirModalExcluirLista = (lista) => {
    setListaSelecionada(lista);
    setModalListaMode('confirm');
    setModalListaType('delete');
    setError('');
    setModalListaAberto(true);
  };

  const fecharModalLista = () => {
    setModalListaAberto(false);
    setModalListaMode('view');
    setModalListaType('');
    setListaSelecionada(null);
    setError('');
    setIsLoading(false);
  };

  // Handlers para modais de exercício
  const abrirModalNovoExercicio = (lista) => {
    setListaParaNovoExercicio(lista);
    setModalExercicioMode('form');
    setModalExercicioType('new');
    setExercicioSelecionado(null);
    setError('');
    setModalExercicioAberto(true);
  };

  const abrirModalVerExercicio = async (exercicioId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/exercicios/${exercicioId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Erro ao carregar exercício');

      const data = await response.json();
      setExercicioSelecionado(data);
      setModalExercicioMode('view');
      setModalExercicioType('view');
      setError('');
      setModalExercicioAberto(true);
    } catch (error) {
      console.error('Erro ao carregar exercício:', error);
    }
  };

  // Nova função que distingue entre aluno e professor/admin
  const handleClickExercicio = async (exercicioId) => {
    if (podeEditar) {
      // Se é professor/admin, abrir modal de visualização
      await abrirModalVerExercicio(exercicioId);
    } else {
      // Se é aluno, navegar para página de resolução
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3001/exercicios/${exercicioId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Erro ao carregar exercício');

        const data = await response.json();
        setExercicioParaResolver(data);
        setMostraResolverExercicio(true);
      } catch (error) {
        console.error('Erro ao carregar exercício para resolução:', error);
        setError('Erro ao carregar exercício');
      }
    }
  };

  // Função para voltar da página de resolução para a listagem
  const voltarParaListagem = () => {
    setMostraResolverExercicio(false);
    setExercicioParaResolver(null);
  };

  const abrirModalEditarExercicio = async (exercicioId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/exercicios/${exercicioId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Erro ao carregar exercício para edição');

      const data = await response.json();
      setExercicioSelecionado(data);
      setModalExercicioMode('form');
      setModalExercicioType('edit');
      setError('');
      setModalExercicioAberto(true);
    } catch (error) {
      console.error('Erro ao carregar exercício para edição:', error);
    }
  };

  const abrirModalExcluirExercicio = (exercicio) => {
    setExercicioSelecionado(exercicio);
    setModalExercicioMode('confirm');
    setModalExercicioType('delete');
    setError('');
    setModalExercicioAberto(true);
  };

  const fecharModalExercicio = () => {
    setModalExercicioAberto(false);
    setModalExercicioMode('view');
    setModalExercicioType('');
    setExercicioSelecionado(null);
    setListaParaNovoExercicio(null);
    setError('');
    setIsLoading(false);
  };

  // Handler para submissão de lista
  const handleSubmitLista = async (formData) => {
    setIsLoading(true);
    setError('');

    try {
      const dadosEnvio = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        id_turma: turmaSelecionada.id,
        exercicios: formData.exercicios || []
      };

      const token = localStorage.getItem('token');
      const url = modalListaType === 'edit'
        ? `http://localhost:3001/listas/${listaSelecionada.id}`
        : 'http://localhost:3001/listas';

      const method = modalListaType === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dadosEnvio),
      });

      if (!response.ok) throw new Error('Erro ao salvar lista');

      await carregarListas();
      fecharModalLista();
    } catch (error) {
      setError('Erro ao salvar lista: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para exclusão de lista
  const handleConfirmExcluirLista = async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/listas/${listaSelecionada.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Erro ao excluir lista');

      await carregarListas();
      fecharModalLista();
    } catch (error) {
      setError('Erro ao excluir lista: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para submissão de exercício
  const handleSubmitExercicio = async (formData) => {
    setIsLoading(true);
    setError('');

    try {
      if (!formData.alternativas || formData.alternativas.length === 0) {
        throw new Error('Adicione pelo menos uma alternativa para o exercício');
      }

      const dadosEnvio = {
        titulo: formData.titulo,
        enunciado: formData.enunciado,
        dificuldade: parseInt(formData.dificuldade),
        id_mapa: formData.id_mapa ? parseInt(formData.id_mapa) : null,
        alternativas: formData.alternativas.map((alt) => ({
          descricao: alt.descricao,
          correta: alt.correta || false
        }))
      };

      const temCorreta = dadosEnvio.alternativas.some(alt => alt.correta);
      if (!temCorreta) {
        throw new Error('Marque pelo menos uma alternativa como correta');
      }

      const token = localStorage.getItem('token');
      const url = modalExercicioType === 'edit'
        ? `http://localhost:3001/exercicios/${exercicioSelecionado.id}`
        : 'http://localhost:3001/exercicios';

      const method = modalExercicioType === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dadosEnvio),
      });

      if (!response.ok) throw new Error('Erro ao salvar exercício');

      const exercicioCriado = await response.json();

      // Se é um novo exercício, adicionar à lista
      if (modalExercicioType === 'new' && listaParaNovoExercicio) {
        await fetch(`http://localhost:3001/listas/${listaParaNovoExercicio.id}/exercicios`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ id_exercicio: exercicioCriado.exercicio.id }),
        });
      }

      await carregarListas();
      fecharModalExercicio();
    } catch (error) {
      setError('Erro ao salvar exercício: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para exclusão de exercício
  const handleConfirmExcluirExercicio = async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/exercicios/${exercicioSelecionado.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Erro ao excluir exercício');

      await carregarListas();
      fecharModalExercicio();
    } catch (error) {
      setError('Erro ao excluir exercício: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar listas pela busca
  const listasFiltradas = listas.filter(lista =>
    lista.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
    lista.descricao.toLowerCase().includes(termoBusca.toLowerCase())
  );

  // Configurações dos modais
  const getModalListaConfig = () => {
    const baseConfig = {
      isOpen: modalListaAberto,
      onClose: fecharModalLista,
      isLoading,
      error
    };

    switch (modalListaType) {
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
              required: false,
              rows: 3,
              placeholder: 'Digite uma descrição (opcional)'
            }
          ],
          initialFormData: {},
          onSubmit: handleSubmitLista,
          submitText: 'Criar Lista'
        };

      case 'edit':
        return {
          ...baseConfig,
          mode: 'form',
          title: 'Editar Lista de Exercícios',
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
              required: false,
              rows: 3,
              placeholder: 'Digite uma descrição (opcional)'
            }
          ],
          initialFormData: listaSelecionada ? {
            titulo: listaSelecionada.titulo || '',
            descricao: listaSelecionada.descricao || ''
          } : {},
          onSubmit: handleSubmitLista,
          submitText: 'Salvar Alterações'
        };

      case 'delete':
        return {
          ...baseConfig,
          mode: 'confirm',
          title: 'Confirmar Exclusão',
          message: `Deseja realmente excluir a lista "${listaSelecionada?.titulo}"? Todos os exercícios associados também serão removidos. Esta ação não pode ser desfeita.`,
          confirmText: 'Excluir',
          confirmType: 'danger',
          onConfirm: handleConfirmExcluirLista
        };

      default:
        return baseConfig;
    }
  };

  const getModalExercicioConfig = () => {
    const baseConfig = {
      isOpen: modalExercicioAberto,
      onClose: fecharModalExercicio,
      isLoading,
      error
    };

    switch (modalExercicioType) {
      case 'new':
        return {
          ...baseConfig,
          mode: 'form',
          title: `Novo Exercício - ${listaParaNovoExercicio?.titulo}`,
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
                fecharModalExercicio();
                setTimeout(() => abrirModalEditarExercicio(exercicioSelecionado.id), 100);
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
          onConfirm: handleConfirmExcluirExercicio
        };

      default:
        return baseConfig;
    }
  };

  return (
    <>
      {mostraResolverExercicio ? (
        <ResolverExercicioPage
          exercicio={exercicioParaResolver}
          onVoltar={voltarParaListagem}
        />
      ) : (
        <TabPageLayout
          title="Listas de Exercícios"
          icon="fa-list-alt"
          subtitle="Gerencie listas de exercícios e seus conteúdos"
        >
          {!turmaSelecionada ? (
            <div className={styles.emptyState}>
              <i className="fa-solid fa-users"></i>
              <h3>Nenhuma turma selecionada</h3>
              <p>Selecione uma turma para visualizar e gerenciar listas de exercícios específicas da turma.</p>
            </div>
          ) : (
            <>
              <SearchBar
                searchTerm={termoBusca}
                onSearchChange={setTermoBusca}
                onNew={podeEditar ? abrirModalNovaLista : null}
                placeholder="Buscar listas..."
                buttonText="Nova Lista"
                buttonIcon="fa-plus"
                showSearch={true}
                showButton={podeEditar}
              />

              <div className={styles.listasContainer}>
                {listasFiltradas.length === 0 ? (
                  <div className={styles.emptyState}>
                    <i className="fa-solid fa-list-alt"></i>
                    <h3>Nenhuma lista encontrada</h3>
                    <p>Crie sua primeira lista de exercícios para esta turma!</p>
                  </div>
                ) : (
                  listasFiltradas.map((lista) => (
                    <div key={lista.id} className={styles.listaCard}>
                      <div
                        className={styles.listaHeader}
                        onClick={() => toggleLista(lista.id)}
                      >
                        <div className={styles.listaInfo}>
                          <h3 className={styles.listaTitulo}>{lista.titulo}</h3>
                          <p className={styles.listaDescricao}>
                            {lista.descricao || 'Sem descrição'}
                          </p>
                          <div className={styles.listaStats}>
                            <span className={styles.exerciciosCount}>
                              <i className="fa-solid fa-book"></i>
                              {exerciciosPorLista[lista.id]?.length || 0} exercícios
                            </span>
                          </div>
                        </div>
                        <div className={styles.listaActions}>
                          {podeEditar && (
                            <>
                              <button
                                className={styles.actionButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  abrirModalEditarLista(lista);
                                }}
                                title="Editar lista"
                              >
                                <i className="fa-solid fa-edit"></i>
                              </button>
                              <button
                                className={styles.actionButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  abrirModalExcluirLista(lista);
                                }}
                                title="Excluir lista"
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </>
                          )}
                          <div className={styles.expandIcon}>
                            <i className={`fa-solid ${listasExpandidas[lista.id] ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                          </div>
                        </div>
                      </div>

                      {/* Collapse de exercícios */}
                      {listasExpandidas[lista.id] && (
                        <div className={styles.exerciciosCollapse}>
                          <div className={styles.exerciciosHeader}>
                            <h4>Exercícios da Lista</h4>
                            {podeEditar && (
                              <button
                                className={styles.newExercicioButton}
                                onClick={() => abrirModalNovoExercicio(lista)}
                              >
                                <i className="fa-solid fa-plus"></i>
                                Novo Exercício
                              </button>
                            )}
                          </div>

                          <div className={styles.exerciciosList}>
                            {(!exerciciosPorLista[lista.id] || exerciciosPorLista[lista.id].length === 0) ? (
                              <div className={styles.exerciciosEmpty}>
                                <i className="fa-solid fa-book"></i>
                                <p>Esta lista não contém exercícios ainda.</p>
                                {podeEditar && (
                                  <button
                                    className={styles.firstExercicioButton}
                                    onClick={() => abrirModalNovoExercicio(lista)}
                                  >
                                    Criar primeiro exercício
                                  </button>
                                )}
                              </div>
                            ) : (
                              exerciciosPorLista[lista.id].map((exercicio) => (
                                <div key={exercicio.id} className={styles.exercicioItem}>
                                  <div className={styles.exercicioInfo}>
                                    <h5 className={styles.exercicioTitulo}>{exercicio.titulo}</h5>
                                    <div className={styles.exercicioMeta}>
                                      <span className={styles.dificuldade}>
                                        Dificuldade: {exercicio.dificuldade}/10
                                      </span>
                                    </div>
                                  </div>
                                  <div className={styles.exercicioActions}>
                                    <button
                                      className={styles.exercicioActionButton}
                                      onClick={() => handleClickExercicio(exercicio.id)}
                                      title={podeEditar ? "Ver exercício" : "Resolver exercício"}
                                    >
                                      <i className={podeEditar ? "fa-solid fa-eye" : "fa-solid fa-play"}></i>
                                    </button>
                                    {podeEditar && (
                                      <>
                                        <button
                                          className={styles.exercicioActionButton}
                                          onClick={() => abrirModalEditarExercicio(exercicio.id)}
                                          title="Editar exercício"
                                        >
                                          <i className="fa-solid fa-edit"></i>
                                        </button>
                                        <button
                                          className={styles.exercicioActionButton}
                                          onClick={() => abrirModalExcluirExercicio(exercicio)}
                                          title="Excluir exercício"
                                        >
                                          <i className="fa-solid fa-trash"></i>
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          <ModalUniversal {...getModalListaConfig()} />
          <ModalUniversal {...getModalExercicioConfig()} />
        </TabPageLayout>
      )}
    </>
  );
}
