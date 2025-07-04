// backend/controllers/relatorioController.js
const relatorioService = require('../services/relatorioService');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'edutech_secret_key_2024';

/**
 * Middleware para verificar se o usuário tem permissão para relatórios
 */
const verificarPermissaoRelatorio = (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ mensagem: 'Token não fornecido.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Apenas professores e admins podem acessar relatórios
        if (!['professor', 'admin'].includes(decoded.tipo)) {
            return res.status(403).json({ mensagem: 'Acesso negado. Apenas professores e administradores podem acessar relatórios.' });
        }

        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ mensagem: 'Token inválido.' });
    }
};

/**
 * Obter dashboard geral
 */
const obterDashboardGeral = async (req, res) => {
    try {
        const dashboard = await relatorioService.obterDashboardGeral();
        res.status(200).json(dashboard);
    } catch (error) {
        console.error('Erro no controller ao obter dashboard geral:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Obter relatório de turmas
 */
const obterRelatorioTurmas = async (req, res) => {
    try {
        const turmas = await relatorioService.obterRelatorioTurmas();
        res.status(200).json(turmas);
    } catch (error) {
        console.error('Erro no controller ao obter relatório de turmas:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Obter relatório de usuários
 */
const obterRelatorioUsuarios = async (req, res) => {
    try {
        const { tipo } = req.query;
        const usuarios = await relatorioService.obterRelatorioUsuarios(tipo);
        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Erro no controller ao obter relatório de usuários:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Obter relatório de listas
 */
const obterRelatorioListas = async (req, res) => {
    try {
        const { id_turma } = req.query;
        const listas = await relatorioService.obterRelatorioListas(id_turma);
        res.status(200).json(listas);
    } catch (error) {
        console.error('Erro no controller ao obter relatório de listas:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Obter relatório de exercícios
 */
const obterRelatorioExercicios = async (req, res) => {
    try {
        const { dificuldade } = req.query;
        const exercicios = await relatorioService.obterRelatorioExercicios(dificuldade);
        res.status(200).json(exercicios);
    } catch (error) {
        console.error('Erro no controller ao obter relatório de exercícios:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Obter relatório de mapas
 */
const obterRelatorioMapas = async (req, res) => {
    try {
        const mapas = await relatorioService.obterRelatorioMapas();
        res.status(200).json(mapas);
    } catch (error) {
        console.error('Erro no controller ao obter relatório de mapas:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Obter relatório de alunos por turma
 */
const obterRelatorioAlunosTurmas = async (req, res) => {
    try {
        const { id_turma } = req.query;
        const alunos = await relatorioService.obterRelatorioAlunosTurmas(id_turma);
        res.status(200).json(alunos);
    } catch (error) {
        console.error('Erro no controller ao obter relatório de alunos:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Obter relatório de professores por turma
 */
const obterRelatorioProfessoresTurmas = async (req, res) => {
    try {
        const { id_turma } = req.query;
        const professores = await relatorioService.obterRelatorioProfessoresTurmas(id_turma);
        res.status(200).json(professores);
    } catch (error) {
        console.error('Erro no controller ao obter relatório de professores:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Obter exercícios órfãos
 */
const obterExerciciosOrfaos = async (req, res) => {
    try {
        const exercicios = await relatorioService.obterExerciciosOrfaos();
        res.status(200).json(exercicios);
    } catch (error) {
        console.error('Erro no controller ao obter exercícios órfãos:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Obter listas sem turma
 */
const obterListasSemTurma = async (req, res) => {
    try {
        const listas = await relatorioService.obterListasSemTurma();
        res.status(200).json(listas);
    } catch (error) {
        console.error('Erro no controller ao obter listas sem turma:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Obter estatísticas de uma turma específica
 */
const obterEstatisticasTurma = async (req, res) => {
    try {
        const { id } = req.params;
        const estatisticas = await relatorioService.obterEstatisticasTurma(id);
        
        if (!estatisticas) {
            return res.status(404).json({ mensagem: 'Turma não encontrada.' });
        }
        
        res.status(200).json(estatisticas);
    } catch (error) {
        console.error('Erro no controller ao obter estatísticas da turma:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Obter distribuição de dificuldade dos exercícios
 */
const obterDistribuicaoDificuldade = async (req, res) => {
    try {
        const distribuicao = await relatorioService.obterDistribuicaoDificuldade();
        res.status(200).json(distribuicao);
    } catch (error) {
        console.error('Erro no controller ao obter distribuição de dificuldade:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Obter top mapas mais utilizados
 */
const obterTopMapasUtilizados = async (req, res) => {
    try {
        const { limite = 10 } = req.query;
        const mapas = await relatorioService.obterTopMapasUtilizados(parseInt(limite));
        res.status(200).json(mapas);
    } catch (error) {
        console.error('Erro no controller ao obter top mapas:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

module.exports = {
    verificarPermissaoRelatorio,
    obterDashboardGeral,
    obterRelatorioTurmas,
    obterRelatorioUsuarios,
    obterRelatorioListas,
    obterRelatorioExercicios,
    obterRelatorioMapas,
    obterRelatorioAlunosTurmas,
    obterRelatorioProfessoresTurmas,
    obterExerciciosOrfaos,
    obterListasSemTurma,
    obterEstatisticasTurma,
    obterDistribuicaoDificuldade,
    obterTopMapasUtilizados
};
