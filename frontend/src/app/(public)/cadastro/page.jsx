'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function CadastroPage() {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: '',
        tipo: 'aluno' // Default to student
    });
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState(false);
    const router = useRouter();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setErro(''); // Clear error when typing
    };

    const handleTipoChange = (tipo) => {
        setFormData(prev => ({
            ...prev,
            tipo
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErro('');
        setSucesso(false);

        try {
            // Validações
            if (!formData.nome || !formData.email || !formData.senha || !formData.confirmarSenha) {
                setErro('Todos os campos são obrigatórios.');
                return;
            }

            if (formData.senha !== formData.confirmarSenha) {
                setErro('As senhas não coincidem.');
                return;
            }

            if (formData.senha.length < 6) {
                setErro('A senha deve ter pelo menos 6 caracteres.');
                return;
            }

            // Enviar dados para o backend
            const response = await fetch('http://localhost:3001/usuarios/cadastro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome: formData.nome,
                    email: formData.email,
                    senha: formData.senha,
                    tipo: formData.tipo
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErro(errorData.mensagem || 'Erro ao cadastrar usuário.');
                return;
            }

            setSucesso(true);
            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (error) {
            console.error('Erro ao cadastrar:', error);
            setErro('Erro de conexão. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (sucesso) {
        return (
            <div className={styles.container}>
                <div className={styles.successBox}>
                    <div className={styles.successIcon}>✓</div>
                    <h2>Cadastro realizado com sucesso!</h2>
                    <p>Você será redirecionado para a página de login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.cadastroBox}>
                {/* Left Section - Logo */}
                <div className={styles.leftSection}>
                    <div className={styles.logo}>
                        <img src="/nome_logo_edutech.png" alt="EduTech" />
                    </div>
                    <div className={styles.welcomeInfo}>
                        <h3>Bem-vindo ao EduTech!</h3>
                        <p>Cadastre-se para começar sua jornada educacional.</p>
                        <div className={styles.features}>
                            <div className={styles.feature}>
                                <span className={styles.featureIcon}>📚</span>
                                <span>Acesso a exercícios interativos</span>
                            </div>
                            <div className={styles.feature}>
                                <span className={styles.featureIcon}>🎯</span>
                                <span>Listas personalizadas</span>
                            </div>
                            <div className={styles.feature}>
                                <span className={styles.featureIcon}>📊</span>
                                <span>Acompanhe seu progresso</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section - Form */}
                <div className={styles.rightSection}>
                    <h1>Criar Conta</h1>
                    <p className={styles.subtitle}>Preencha os dados para se cadastrar</p>

                    {erro && (
                        <div className={styles.erro}>
                            {erro}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="nome">Nome Completo</label>
                            <input
                                type="text"
                                id="nome"
                                name="nome"
                                value={formData.nome}
                                onChange={handleInputChange}
                                placeholder="Digite seu nome completo"
                                disabled={loading}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Digite seu e-mail"
                                disabled={loading}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="senha">Senha</label>
                            <input
                                type="password"
                                id="senha"
                                name="senha"
                                value={formData.senha}
                                onChange={handleInputChange}
                                placeholder="Digite sua senha (mín. 6 caracteres)"
                                disabled={loading}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmarSenha">Confirmar Senha</label>
                            <input
                                type="password"
                                id="confirmarSenha"
                                name="confirmarSenha"
                                value={formData.confirmarSenha}
                                onChange={handleInputChange}
                                placeholder="Confirme sua senha"
                                disabled={loading}
                            />
                        </div>

                        <div className={styles.tipoGroup}>
                            <label>Você é:</label>
                            <div className={styles.tipoOptions}>
                                <button
                                    type="button"
                                    className={`${styles.tipoOption} ${formData.tipo === 'aluno' ? styles.selected : ''}`}
                                    onClick={() => handleTipoChange('aluno')}
                                    disabled={loading}
                                >
                                    <span className={styles.tipoIcon}>🎓</span>
                                    <span className={styles.tipoLabel}>Aluno</span>
                                    <span className={styles.tipoDescription}>
                                        Resolva exercícios e acompanhe seu progresso
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.tipoOption} ${formData.tipo === 'professor' ? styles.selected : ''}`}
                                    onClick={() => handleTipoChange('professor')}
                                    disabled={loading}
                                >
                                    <span className={styles.tipoIcon}>👨‍🏫</span>
                                    <span className={styles.tipoLabel}>Professor</span>
                                    <span className={styles.tipoDescription}>
                                        Crie turmas, exercícios e acompanhe alunos
                                    </span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? 'Cadastrando...' : 'Criar Conta'}
                        </button>
                    </form>

                    <div className={styles.loginLink}>
                        <p>Já tem uma conta? <Link href="/login">Faça login</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
