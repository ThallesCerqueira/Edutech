// backend/routes/relatorios.js
const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorioController');
const { asyncHandler } = require('../middlewares/errorHandler');
const { verifyToken, requireAdminOrProfessor } = require('../middlewares/authMiddleware');

/**
 * GET /relatorios/dashboard
 * Endpoint para obter estatísticas gerais do dashboard.
 * Apenas admins e professores podem ver relatórios.
 */
router.get('/dashboard', verifyToken, requireAdminOrProfessor, asyncHandler(relatorioController.obterDashboardGeral));

/**
 * GET /relatorios/turmas
 * Endpoint para obter relatório de turmas com estatísticas.
 * Apenas admins e professores podem ver relatórios.
 */
router.get('/turmas', verifyToken, requireAdminOrProfessor, asyncHandler(relatorioController.obterRelatorioTurmas));

/**
 * GET /relatorios/turmas/:id/estatisticas
 * Endpoint para obter estatísticas detalhadas de uma turma específica.
 */
router.get('/turmas/:id/estatisticas', asyncHandler(relatorioController.obterEstatisticasTurma));

/**
 * GET /relatorios/usuarios
 * Endpoint para obter relatório de usuários.
 * Query params: ?tipo=aluno|professor|admin
 */
router.get('/usuarios', asyncHandler(relatorioController.obterRelatorioUsuarios));

/**
 * GET /relatorios/listas
 * Endpoint para obter relatório de listas.
 * Query params: ?id_turma=123
 */
router.get('/listas', asyncHandler(relatorioController.obterRelatorioListas));

/**
 * GET /relatorios/exercicios
 * Endpoint para obter relatório de exercícios.
 * Query params: ?dificuldade=1|2|3|4|5
 */
router.get('/exercicios', asyncHandler(relatorioController.obterRelatorioExercicios));

/**
 * GET /relatorios/mapas
 * Endpoint para obter relatório de mapas com estatísticas de uso.
 */
router.get('/mapas', asyncHandler(relatorioController.obterRelatorioMapas));

/**
 * GET /relatorios/alunos-turmas
 * Endpoint para obter relatório de alunos por turma.
 * Query params: ?id_turma=123
 */
router.get('/alunos-turmas', asyncHandler(relatorioController.obterRelatorioAlunosTurmas));

/**
 * GET /relatorios/professores-turmas
 * Endpoint para obter relatório de professores por turma.
 * Query params: ?id_turma=123
 */
router.get('/professores-turmas', asyncHandler(relatorioController.obterRelatorioProfessoresTurmas));

/**
 * GET /relatorios/exercicios-orfaos
 * Endpoint para obter exercícios que não estão associados a nenhuma lista.
 */
router.get('/exercicios-orfaos', asyncHandler(relatorioController.obterExerciciosOrfaos));

/**
 * GET /relatorios/listas-sem-turma
 * Endpoint para obter listas que não estão associadas a nenhuma turma.
 */
router.get('/listas-sem-turma', asyncHandler(relatorioController.obterListasSemTurma));

/**
 * GET /relatorios/distribuicao-dificuldade
 * Endpoint para obter distribuição de dificuldade dos exercícios.
 */
router.get('/distribuicao-dificuldade', asyncHandler(relatorioController.obterDistribuicaoDificuldade));

/**
 * GET /relatorios/top-mapas
 * Endpoint para obter top mapas mais utilizados.
 * Query params: ?limite=10
 */
router.get('/top-mapas', asyncHandler(relatorioController.obterTopMapasUtilizados));

module.exports = router;
