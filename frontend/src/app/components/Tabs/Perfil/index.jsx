'use client';
import { TabPageLayout } from "@/app/components/Layout";
import { ModalUniversal } from "@/app/components/Modal";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import styles from "./index.module.css";

export default function PerfilPage() {
    const { usuario, login } = useAuth();
    const [modalAberto, setModalAberto] = useState(false);
    const [modalMode, setModalMode] = useState('view');
    const [modalType, setModalType] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const abrirModalEditar = () => {
        setModalMode('form');
        setModalType('edit');
        setError('');
        setSuccess('');
        setModalAberto(true);
    };

    const abrirModalSenha = () => {
        setModalMode('form');
        setModalType('password');
        setError('');
        setSuccess('');
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
        setModalMode('view');
        setModalType('');
        setError('');
        setSuccess('');
        setIsLoading(false);
    };

    const handleAtualizarPerfil = async (formData) => {
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`http://localhost:3001/usuarios/${usuario.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome: formData.nome.trim(),
                    email: formData.email.trim().toLowerCase()
                }),
            });

            if (!response.ok) {
                let errorMessage = 'Erro ao atualizar perfil';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.mensagem || errorMessage;

                    if (response.status === 409) {
                        errorMessage = 'Este email já está sendo usado por outro usuário';
                    } else if (response.status >= 500) {
                        errorMessage = 'Erro interno do servidor. Tente novamente.';
                    }
                } catch (parseError) {
                    errorMessage = `Erro de conexão (${response.status})`;
                }
                throw new Error(errorMessage);
            }

            const dadosAtualizados = await response.json();

            // Atualizar o contexto de autenticação com os novos dados
            const usuarioAtualizado = { ...usuario, ...dadosAtualizados };
            login(usuarioAtualizado, localStorage.getItem('token'));

            setSuccess('Perfil atualizado com sucesso!');
            setTimeout(() => {
                fecharModal();
            }, 2000);

        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            setError(error.message || 'Erro inesperado ao atualizar perfil');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAtualizarSenha = async (formData) => {
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            // Validação client-side
            if (formData.novaSenha !== formData.confirmarSenha) {
                throw new Error('A nova senha e confirmação não coincidem');
            }

            if (formData.novaSenha.length < 6) {
                throw new Error('A nova senha deve ter pelo menos 6 caracteres');
            }

            const response = await fetch(`http://localhost:3001/usuarios/${usuario.id}/senha`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    senhaAtual: formData.senhaAtual,
                    novaSenha: formData.novaSenha
                }),
            });

            if (!response.ok) {
                let errorMessage = 'Erro ao alterar senha';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.mensagem || errorMessage;

                    if (response.status === 401) {
                        errorMessage = 'Senha atual incorreta';
                    } else if (response.status >= 500) {
                        errorMessage = 'Erro interno do servidor. Tente novamente.';
                    }
                } catch (parseError) {
                    errorMessage = `Erro de conexão (${response.status})`;
                }
                throw new Error(errorMessage);
            }

            setSuccess('Senha alterada com sucesso!');
            setTimeout(() => {
                fecharModal();
            }, 2000);

        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            setError(error.message || 'Erro inesperado ao alterar senha');
        } finally {
            setIsLoading(false);
        }
    };

    const getModalConfig = () => {
        const baseConfig = {
            isOpen: modalAberto,
            onClose: fecharModal,
            isLoading,
            error,
            success
        };

        switch (modalType) {
            case 'edit':
                return {
                    ...baseConfig,
                    mode: 'form',
                    title: 'Editar Perfil',
                    formFields: [
                        {
                            key: 'nome',
                            label: 'Nome Completo',
                            type: 'text',
                            required: true,
                            placeholder: 'Digite seu nome completo'
                        },
                        {
                            key: 'email',
                            label: 'E-mail',
                            type: 'email',
                            required: true,
                            placeholder: 'Digite seu e-mail'
                        }
                    ],
                    initialFormData: {
                        nome: usuario?.nome || '',
                        email: usuario?.email || ''
                    },
                    onSubmit: handleAtualizarPerfil,
                    submitText: 'Salvar Alterações'
                };

            case 'password':
                return {
                    ...baseConfig,
                    mode: 'form',
                    title: 'Alterar Senha',
                    formFields: [
                        {
                            key: 'senhaAtual',
                            label: 'Senha Atual',
                            type: 'password',
                            required: true,
                            placeholder: 'Digite sua senha atual'
                        },
                        {
                            key: 'novaSenha',
                            label: 'Nova Senha',
                            type: 'password',
                            required: true,
                            placeholder: 'Digite a nova senha (mín. 6 caracteres)'
                        },
                        {
                            key: 'confirmarSenha',
                            label: 'Confirmar Nova Senha',
                            type: 'password',
                            required: true,
                            placeholder: 'Confirme a nova senha'
                        }
                    ],
                    initialFormData: {},
                    onSubmit: handleAtualizarSenha,
                    submitText: 'Alterar Senha'
                };

            default:
                return baseConfig;
        }
    };

    const formatarTipo = (tipo) => {
        switch (tipo) {
            case 'admin': return 'Administrador';
            case 'professor': return 'Professor';
            case 'aluno': return 'Aluno';
            default: return tipo;
        }
    };

    const formatarData = (data) => {
        if (!data) return 'N/A';
        try {
            return new Date(data).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'N/A';
        }
    };

    const headerActions = (
        <div style={{ display: 'flex', gap: '8px' }}>
            <button
                className={styles.editButton}
                onClick={abrirModalEditar}
            >
                <i className="fa-solid fa-edit"></i>
                Editar Perfil
            </button>
            <button
                className={styles.passwordButton}
                onClick={abrirModalSenha}
            >
                <i className="fa-solid fa-key"></i>
                Alterar Senha
            </button>
        </div>
    );

    if (!usuario) {
        return (
            <TabPageLayout
                title="Meu Perfil"
                icon="fa-user"
                subtitle="Gerencie suas informações pessoais e configurações"
            >
                <div className={styles.emptyState}>
                    <i className="fa-solid fa-user-slash"></i>
                    <h3>Usuário não encontrado</h3>
                    <p>Faça login para acessar seu perfil.</p>
                </div>
            </TabPageLayout>
        );
    }

    return (
        <TabPageLayout
            title="Meu Perfil"
            icon="fa-user"
            subtitle="Gerencie suas informações pessoais e configurações"
            headerActions={headerActions}
        >
            <div className={styles.perfilContainer}>
                <div className={styles.avatarSection}>
                    <div className={styles.avatarContainer}>
                        <div className={styles.avatar}>
                            {usuario?.nome ? usuario.nome.charAt(0).toUpperCase() : 'U'}
                        </div>
                    </div>
                    <h2 className={styles.userName}>{usuario?.nome || 'Usuário'}</h2>
                    <p className={styles.userRole}>
                        {formatarTipo(usuario?.tipo)}
                    </p>
                </div>

                <div className={styles.infoSection}>
                    <h3 className={styles.sectionTitle}>Informações Pessoais</h3>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <label className={styles.infoLabel}>Nome Completo</label>
                            <div className={styles.infoValue}>
                                {usuario?.nome || 'N/A'}
                            </div>
                        </div>

                        <div className={styles.infoItem}>
                            <label className={styles.infoLabel}>E-mail</label>
                            <div className={styles.infoValue}>
                                {usuario?.email || 'N/A'}
                            </div>
                        </div>

                        <div className={styles.infoItem}>
                            <label className={styles.infoLabel}>Tipo de Usuário</label>
                            <div className={styles.infoValue}>
                                {formatarTipo(usuario?.tipo)}
                            </div>
                        </div>

                        <div className={styles.infoItem}>
                            <label className={styles.infoLabel}>ID do Usuário</label>
                            <div className={styles.infoValue}>
                                #{usuario?.id || 'N/A'}
                            </div>
                        </div>

                        <div className={styles.infoItem}>
                            <label className={styles.infoLabel}>Data de Cadastro</label>
                            <div className={styles.infoValue}>
                                {formatarData(usuario?.created_at)}
                            </div>
                        </div>

                        <div className={styles.infoItem}>
                            <label className={styles.infoLabel}>Última Atualização</label>
                            <div className={styles.infoValue}>
                                {formatarData(usuario?.updated_at)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ModalUniversal {...getModalConfig()} />
        </TabPageLayout>
    );
}
