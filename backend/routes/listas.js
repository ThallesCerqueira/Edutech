// backend/routes/listas.js
const express = require('express');
const router = express.Router();
const listaController = require('../controllers/listaController');
const { asyncHandler } = require('../middlewares/errorHandler');
const { verifyToken, requireAdminOrProfessor, checkTurmaAccess } = require('../middlewares/authMiddleware');

/**
 * POST /listas
 * Endpoint para criar uma nova lista de exercícios.
 * Apenas admins e professores podem criar listas.
 */
router.post('/', verifyToken, requireAdminOrProfessor, asyncHandler(listaController.criarLista));

/**
 * GET /listas
 * Endpoint para listar todas as listas de exercícios.
 * Todos os usuários autenticados podem ver listas (filtradas por turma).
 */
router.get('/', verifyToken, asyncHandler(listaController.listarListas));

/**
 * GET /listas/:id
 * Endpoint para buscar uma lista de exercícios específica pelo ID.
 * Todos os usuários autenticados podem ver listas.
 */
router.get('/:id', verifyToken, asyncHandler(listaController.buscarListaPorId));

/**
 * GET /listas/:id/exercicios
 * Endpoint para listar exercícios de uma lista específica.
 * Todos os usuários autenticados podem ver exercícios das listas.
 */
router.get('/:id/exercicios', verifyToken, asyncHandler(listaController.listarExerciciosDaLista));

/**
 * POST /listas/:id/exercicios
 * Endpoint para adicionar um exercício a uma lista.
 * Apenas admins e professores podem adicionar exercícios às listas.
 */
router.post('/:id/exercicios', verifyToken, requireAdminOrProfessor, asyncHandler(listaController.adicionarExercicioNaLista));

/**
 * PUT /listas/:id
 * Endpoint para atualizar uma lista de exercícios existente.
 * Apenas admins e professores podem editar listas.
 */
router.put('/:id', verifyToken, requireAdminOrProfessor, asyncHandler(listaController.atualizarLista));

/**
 * DELETE /listas/:id
 * Endpoint para deletar uma lista de exercícios pelo ID.
 * Apenas admins e professores podem excluir listas.
 */
router.delete('/:id', verifyToken, requireAdminOrProfessor, asyncHandler(listaController.deletarLista));

module.exports = router;
