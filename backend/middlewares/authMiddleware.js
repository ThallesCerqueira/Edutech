// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar se o usuário está autenticado
 */
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ mensagem: 'Token de acesso requerido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'edutech_secret_key_2024');
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ mensagem: 'Token inválido' });
    }
};

/**
 * Middleware para verificar se o usuário tem permissão de administrador ou professor
 */
const requireAdminOrProfessor = (req, res, next) => {
    if (!req.usuario) {
        return res.status(401).json({ mensagem: 'Usuário não autenticado' });
    }

    if (req.usuario.tipo !== 'admin' && req.usuario.tipo !== 'professor') {
        return res.status(403).json({ mensagem: 'Acesso negado. Apenas administradores e professores podem realizar esta ação.' });
    }

    next();
};

/**
 * Middleware para verificar se o usuário tem permissão de administrador
 */
const requireAdmin = (req, res, next) => {
    if (!req.usuario) {
        return res.status(401).json({ mensagem: 'Usuário não autenticado' });
    }

    if (req.usuario.tipo !== 'admin') {
        return res.status(403).json({ mensagem: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
    }

    next();
};

/**
 * Middleware para verificar se o usuário pode acessar dados de uma turma específica
 */
const checkTurmaAccess = (req, res, next) => {
    if (!req.usuario) {
        return res.status(401).json({ mensagem: 'Usuário não autenticado' });
    }

    // Admins podem acessar qualquer turma
    if (req.usuario.tipo === 'admin') {
        return next();
    }

    // Para professores e alunos, permitir acesso por enquanto
    // TODO: Implementar verificação de turmas quando o sistema de turmas estiver completo
    // const turmaId = req.params.id_turma || req.query.id_turma || req.body.id_turma;
    // if (turmaId && req.usuario.turmas && !req.usuario.turmas.includes(parseInt(turmaId))) {
    //     return res.status(403).json({ mensagem: 'Acesso negado. Você não tem permissão para acessar esta turma.' });
    // }

    next();
};

module.exports = {
    verifyToken,
    requireAdminOrProfessor,
    requireAdmin,
    checkTurmaAccess
};
