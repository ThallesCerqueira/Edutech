'use client';
import React from 'react';
import styles from "./index.module.css";
import { useState, useEffect } from "react";
import { UniversalList } from '../../Cards';
import { ModalUniversal } from '../../Modal';
import { SearchBar } from '../../SearchBars';

export default function MapasPage() {
  const [mapas, setMapas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [modalType, setModalType] = useState('');
  const [selectedMapa, setSelectedMapa] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mapas filtrados baseado no termo de busca
  const mapasFiltrados = mapas.filter(mapa =>
    mapa.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (mapa.descricao && mapa.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  ); useEffect(() => {
    carregarMapas();
  }, []);

  const carregarMapas = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/mapas');

      if (!response.ok) throw new Error('Erro ao carregar mapas');
      const data = await response.json();
      setMapas(data);
    } catch (error) {
      console.error('Erro ao carregar mapas:', error);
      setMapas([]);
    } finally {
      setLoading(false);
    }
  };

  // Handlers para modais
  const abrirModalNovo = () => {
    setModalMode('form');
    setModalType('new');
    setSelectedMapa(null);
    setError('');
    setModalAberto(true);
  };

  const abrirModalVer = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/mapas/${id}`);
      if (!response.ok) throw new Error('Erro ao carregar mapa');

      const data = await response.json();
      setSelectedMapa(data);
      setModalMode('view');
      setModalType('view');
      setError('');
      setModalAberto(true);
    } catch (error) {
      console.error('Erro ao carregar mapa:', error);
      setError('Erro ao carregar mapa: ' + error.message);
    }
  };

  const abrirModalEditar = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/mapas/${id}`);
      if (!response.ok) throw new Error('Erro ao carregar mapa para edição');

      const data = await response.json();
      setSelectedMapa(data);
      setModalMode('form');
      setModalType('edit');
      setError('');
      setModalAberto(true);
    } catch (error) {
      console.error('Erro ao carregar mapa para edição:', error);
      setError('Erro ao carregar mapa para edição: ' + error.message);
    }
  };

  const abrirModalExcluir = (mapa) => {
    setSelectedMapa(mapa);
    setModalMode('confirm');
    setModalType('delete');
    setError('');
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setModalMode('view');
    setModalType('');
    setSelectedMapa(null);
    setError('');
    setIsLoading(false);
  };

  // Handler para submissão de formulário
  const handleSubmitMapa = async (formData) => {
    setIsLoading(true);
    setError('');

    console.log('Dados do formulário:', formData);

    try {
      const url = modalType === 'edit'
        ? `http://localhost:3001/mapas/${selectedMapa.id}`
        : 'http://localhost:3001/mapas';

      const method = modalType === 'edit' ? 'PUT' : 'POST';

      console.log('Enviando para:', url, 'método:', method);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro HTTP:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText || 'Erro ao salvar mapa'}`);
      }

      await carregarMapas();
      fecharModal();
    } catch (error) {
      console.error('Erro completo:', error);
      setError('Erro ao salvar mapa: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para confirmação de exclusão
  const handleConfirmExcluir = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:3001/mapas/${selectedMapa.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Erro ao excluir mapa');

      await carregarMapas();
      fecharModal();
    } catch (error) {
      setError('Erro ao excluir mapa: ' + error.message);
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
          title: 'Novo Mapa',
          formFields: [
            {
              key: 'titulo',
              label: 'Título',
              type: 'text',
              required: true,
              placeholder: 'Digite o título do mapa'
            },
            {
              key: 'descricao',
              label: 'Descrição',
              type: 'textarea',
              required: false,
              rows: 4,
              placeholder: 'Descreva o mapa educacional (opcional)'
            },
            {
              key: 'dica',
              label: 'Dica',
              type: 'textarea',
              required: false,
              rows: 2,
              placeholder: 'Adicione uma dica sobre o mapa (opcional)'
            },
            {
              key: 'caminho',
              label: 'Imagem do Mapa',
              type: 'image',
              required: false,
              help: 'Selecione uma imagem para o mapa'
            }
          ],
          initialFormData: {},
          onSubmit: handleSubmitMapa,
          submitText: 'Criar Mapa'
        };

      case 'edit':
        return {
          ...baseConfig,
          mode: 'form',
          title: 'Editar Mapa',
          formFields: [
            {
              key: 'titulo',
              label: 'Título',
              type: 'text',
              required: true,
              placeholder: 'Digite o título do mapa'
            },
            {
              key: 'descricao',
              label: 'Descrição',
              type: 'textarea',
              required: false,
              rows: 4,
              placeholder: 'Descreva o mapa educacional (opcional)'
            },
            {
              key: 'dica',
              label: 'Dica',
              type: 'textarea',
              required: false,
              rows: 2,
              placeholder: 'Adicione uma dica sobre o mapa (opcional)'
            },
            {
              key: 'caminho',
              label: 'Imagem do Mapa',
              type: 'image',
              required: false,
              help: 'Selecione uma imagem para o mapa'
            }
          ],
          initialFormData: selectedMapa ? {
            titulo: selectedMapa.titulo || '',
            descricao: selectedMapa.descricao || '',
            dica: selectedMapa.dica || '',
            caminho: selectedMapa.caminho || '',
            // Adicionar preview se for um nome de arquivo
            ...(selectedMapa.caminho && typeof window !== 'undefined' && !selectedMapa.caminho.startsWith('data:') &&
              (selectedMapa.caminho.includes('.jpg') || selectedMapa.caminho.includes('.png')) ? {
              caminho_preview: localStorage.getItem(`image_${selectedMapa.caminho}`) || ''
            } : {})
          } : {},
          onSubmit: handleSubmitMapa,
          submitText: 'Salvar Alterações'
        };

      case 'view':
        return {
          ...baseConfig,
          mode: 'view',
          title: 'Detalhes do Mapa',
          data: selectedMapa || {},
          fields: [
            {
              key: 'titulo',
              label: 'Título'
            },
            {
              key: 'descricao',
              label: 'Descrição',
              render: (value) => value || 'Sem descrição'
            },
            {
              key: 'dica',
              label: 'Dica',
              render: (value) => value || 'Nenhuma dica'
            },
            {
              key: 'caminho',
              label: 'Imagem do Mapa',
              render: (value) => {
                if (!value) return 'Nenhuma imagem';

                // Se é base64, mostrar a imagem
                if (value.startsWith('data:')) {
                  return React.createElement('div', { style: { maxWidth: '200px' } },
                    React.createElement('img', {
                      src: value,
                      alt: 'Imagem do mapa',
                      style: {
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }
                    })
                  );
                }

                // Se não é base64, apenas mostrar o nome do arquivo
                return value;
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
                setTimeout(() => abrirModalEditar(selectedMapa.id), 100);
              }
            }
          ]
        };

      case 'delete':
        return {
          ...baseConfig,
          mode: 'confirm',
          title: 'Confirmar Exclusão',
          message: `Deseja realmente excluir o mapa "${selectedMapa?.titulo}"? Esta ação não pode ser desfeita.`,
          confirmText: 'Excluir',
          confirmType: 'danger',
          onConfirm: handleConfirmExcluir
        };

      default:
        return baseConfig;
    }
  };

  const handleVerMapa = (mapaOrId) => {
    const id = typeof mapaOrId === 'object' ? mapaOrId.id : mapaOrId;
    abrirModalVer(id);
  };

  const handleEditarMapa = (mapaOrId) => {
    const id = typeof mapaOrId === 'object' ? mapaOrId.id : mapaOrId;
    abrirModalEditar(id);
  };

  const handleExcluirMapa = (mapaOrId) => {
    const mapa = typeof mapaOrId === 'object' ? mapaOrId : mapas.find(m => m.id === mapaOrId);
    abrirModalExcluir(mapa);
  };

  const handleNovoMapa = abrirModalNovo;

  return (
    <div className={styles.mainContainer}>
      <h1>Mapas Educacionais</h1>

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNew={handleNovoMapa}
        placeholder="Buscar mapas..."
        buttonText="Novo Mapa"
        buttonIcon="fa-plus"
        showSearch={true}
      />

      <UniversalList
        items={mapasFiltrados}
        onVer={handleVerMapa}
        onEditar={handleEditarMapa}
        onExcluir={handleExcluirMapa}
        type="mapa"
        layout="visual"
        emptyMessage="Nenhum mapa encontrado."
        emptySubMessage="Crie seu primeiro mapa educacional!"
        emptyIcon="fa-solid fa-map"
      />

      <ModalUniversal {...getModalConfig()} />
    </div>
  );
}