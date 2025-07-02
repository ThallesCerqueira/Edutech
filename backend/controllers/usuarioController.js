// backend/controllers/usuarioController.js
const usuarioService = require('../services/usuarioService');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'edutech_secret_key_2024';

/**
 * Controller para cadastrar um novo usuário
 */
const cadastrarUsuario = async (req, res) => {
    try {
        const { nome, email, senha, tipo = 'aluno' } = req.body;

        // Validação básica
        if (!nome || !email || !senha) {
            return res.status(400).json({
                mensagem: 'Nome, email e senha são obrigatórios.'
            });
        }

        // Verificar se o email já existe
        const usuarioExistente = await usuarioService.buscarUsuarioPorEmail(email);
        if (usuarioExistente) {
            return res.status(400).json({
                mensagem: 'Email já cadastrado.'
            });
        }

        const novoUsuarioId = await usuarioService.criarUsuario({
            nome, email, senha, tipo
        });

        res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso.',
            id: novoUsuarioId
        });
    } catch (error) {
        console.error('Erro no controller ao cadastrar usuário:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Controller para fazer login do usuário
 */
const loginUsuario = async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Validação básica
        if (!email || !senha) {
            return res.status(400).json({
                mensagem: 'Email e senha são obrigatórios.'
            });
        }

        const usuario = await usuarioService.autenticarUsuario(email, senha);

        if (!usuario) {
            return res.status(401).json({
                mensagem: 'Email ou senha inválidos.'
            });
        }

        // Gerar token JWT
        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                tipo: usuario.tipo
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            mensagem: 'Login realizado com sucesso.',
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo
            },
            token
        });
    } catch (error) {
        console.error('Erro no controller ao fazer login:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Controller para obter perfil do usuário logado
 */
const obterPerfil = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ mensagem: 'Token não fornecido.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const usuario = await usuarioService.buscarUsuarioPorId(decoded.id);

        if (!usuario) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }

        res.status(200).json({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            tipo: usuario.tipo,
            criado_em: usuario.criado_em
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ mensagem: 'Token inválido.' });
        }
        console.error('Erro no controller ao obter perfil:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Controller para atualizar perfil do usuário logado
 */
const atualizarPerfil = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ mensagem: 'Token não fornecido.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const { nome, email } = req.body;

        const usuarioAtualizado = await usuarioService.atualizarUsuario(decoded.id, {
            nome, email
        });

        if (!usuarioAtualizado) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }

        res.status(200).json({
            mensagem: 'Perfil atualizado com sucesso.',
            usuario: usuarioAtualizado
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ mensagem: 'Token inválido.' });
        }
        console.error('Erro no controller ao atualizar perfil:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Controller para listar todos os usuários (apenas admin)
 */
const listarUsuarios = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ mensagem: 'Token não fornecido.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.tipo !== 'admin') {
            return res.status(403).json({ mensagem: 'Acesso negado. Apenas administradores.' });
        }

        const usuarios = await usuarioService.listarUsuarios();
        res.status(200).json(usuarios);
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ mensagem: 'Token inválido.' });
        }
        console.error('Erro no controller ao listar usuários:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Controller para deletar um usuário
 */
const deletarUsuario = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ mensagem: 'Token não fornecido.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.tipo !== 'admin') {
            return res.status(403).json({ mensagem: 'Acesso negado. Apenas administradores.' });
        }

        const { id } = req.params;

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ mensagem: 'ID inválido.' });
        }

        const deletado = await usuarioService.deletarUsuario(parseInt(id));

        if (!deletado) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }

        res.status(200).json({ mensagem: 'Usuário deletado com sucesso.' });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ mensagem: 'Token inválido.' });
        }
        console.error('Erro no controller ao deletar usuário:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

module.exports = {
    cadastrarUsuario,
    loginUsuario,
    obterPerfil,
    atualizarPerfil,
    listarUsuarios,
    deletarUsuario
};
