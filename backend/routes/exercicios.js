// backend/routes/exercicios.js
const express = require('express');
const router = express.Router();
const exercicioController = require('../controllers/exercicioController');
const { asyncHandler } = require('../middlewares/errorHandler');
const { verifyToken, requireAdminOrProfessor, checkTurmaAccess } = require('../middlewares/authMiddleware');

/**
 * POST /exercicios
 * Endpoint para criar um novo exercício.
 * Apenas admins e professores podem criar exercícios.
 */
router.post('/', verifyToken, requireAdminOrProfessor, asyncHandler(exercicioController.criarExercicio));

/**
 * GET /exercicios/turma/:id_turma
 * Endpoint para listar exercícios de uma turma específica.
 * Todos os usuários autenticados podem ver exercícios da turma à qual pertencem.
 */
router.get('/turma/:id_turma', verifyToken, checkTurmaAccess, asyncHandler(exercicioController.listarExerciciosPorTurma));

/**
 * GET /exercicios/:id
 * Endpoint para buscar um exercício específico pelo ID.
 * Todos os usuários autenticados podem ver exercícios.
 */
router.get('/:id', verifyToken, asyncHandler(exercicioController.buscarExercicioPorId));

/**
 * GET /exercicios
 * Endpoint para listar todos os exercícios.
 * Todos os usuários autenticados podem ver exercícios.
 */
router.get('/', verifyToken, asyncHandler(exercicioController.listarExercicios));

/**
 * PUT /exercicios/:id
 * Endpoint para atualizar um exercício existente.
 * Apenas admins e professores podem editar exercícios.
 */
router.put('/:id', verifyToken, requireAdminOrProfessor, asyncHandler(exercicioController.atualizarExercicio));

/**
 * DELETE /exercicios/:id
 * Endpoint para deletar um exercício pelo ID.
 * Apenas admins e professores podem excluir exercícios.
 */
router.delete('/:id', verifyToken, requireAdminOrProfessor, asyncHandler(exercicioController.deletarExercicio));

module.exports = router;
