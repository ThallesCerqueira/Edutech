'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import styles from './page.module.css';

export default function LoginPage() {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        senha: ''
    });
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const router = useRouter();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setErro(''); // Limpa erro ao digitar
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErro('');

        try {
            // Validações do login
            if (!formData.email || !formData.senha) {
                setErro('Email e senha são obrigatórios.');
                return;
            }

            // Login
            const response = await fetch('http://localhost:3001/usuarios/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    senha: formData.senha
                })
            });

            if (!response.ok) {
                let errorMessage = 'Erro ao fazer login';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.mensagem || errorMessage;
                } catch (parseError) {
                    console.error('Erro ao parsear resposta de erro:', parseError);
                    errorMessage = `Erro HTTP ${response.status}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (!data.token || !data.usuario) {
                throw new Error('Dados de login inválidos recebidos do servidor');
            }

            // Usar o contexto de autenticação para fazer login
            login(data.usuario, data.token);

            // Redirecionar para a página principal
            router.push('/');

        } catch (error) {
            console.error('Erro completo no login:', error);
            setErro(error.message || 'Erro inesperado ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginBox}>
                <div className={styles.leftSection}>
                    <div className={styles.logo}>
                        <img src="/nome_logo_edutech.png" alt="EduTech" />
                    </div>

                    <div className={styles.demoInfo}>
                        <h3>Dados para demonstração:</h3>
                        <p><strong>Email:</strong> admin@edutech.com</p>
                        <p><strong>Senha:</strong> 123456</p>
                        <small>Use essas credenciais para testar o sistema</small>
                    </div>
                </div>

                <div className={styles.rightSection}>
                    <h1>Entrar no Sistema</h1>

                    {erro && (
                        <div className={styles.erro}>
                            {erro}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
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
                                placeholder="Digite sua senha"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? 'Carregando...' : 'Entrar'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
