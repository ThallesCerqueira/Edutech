// backend/routes/mapas.js
const express = require('express');
const router = express.Router();
const mapaController = require('../controllers/mapaController');
const { asyncHandler } = require('../middlewares/errorHandler');
const { verifyToken, requireAdminOrProfessor } = require('../middlewares/authMiddleware');

/**
 * POST /mapas
 * Endpoint para criar um novo mapa.
 * Apenas admins e professores podem criar mapas.
 */
router.post('/', verifyToken, requireAdminOrProfessor, asyncHandler(mapaController.criarMapa));

/**
 * GET /mapas
 * Endpoint para listar todos os mapas.
 * Todos os usuários autenticados podem ver mapas.
 */
router.get('/', verifyToken, asyncHandler(mapaController.listarMapas));

/**
 * GET /mapas/:id
 * Endpoint para buscar um mapa específico pelo ID.
 * Todos os usuários autenticados podem ver mapas.
 */
router.get('/:id', verifyToken, asyncHandler(mapaController.buscarMapaPorId));

/**
 * PUT /mapas/:id
 * Endpoint para atualizar um mapa existente.
 * Apenas admins e professores podem editar mapas.
 */
router.put('/:id', verifyToken, requireAdminOrProfessor, asyncHandler(mapaController.atualizarMapa));

/**
 * DELETE /mapas/:id
 * Endpoint para deletar um mapa pelo ID.
 * Apenas admins e professores podem excluir mapas.
 */
router.delete('/:id', verifyToken, requireAdminOrProfessor, asyncHandler(mapaController.deletarMapa));

module.exports = router;
