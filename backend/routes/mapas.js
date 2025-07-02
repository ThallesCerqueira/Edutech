// backend/routes/mapas.js
const express = require('express');
const router = express.Router();
const mapaController = require('../controllers/mapaController');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * POST /mapas
 * Endpoint para criar um novo mapa.
 * Exemplo de corpo da requisição:
 * {
 *   "titulo": "Meu Mapa",
 *   "dica": "Dica do mapa",
 *   "descricao": "Descrição do mapa",
 *   "caminho": "Caminho do mapa"
 * }
 * Retorna o ID do novo mapa criado.
 */
router.post('/', asyncHandler(mapaController.criarMapa));

/**
 * GET /mapas
 * Endpoint para listar todos os mapas.
 * Retorna um array de objetos com id e titulo.
 * Exemplo de resposta:
 * [
 *  { "id": 1, "titulo": "Mapa 1" },
 *  { "id": 2, "titulo": "Mapa 2" }
 * ]
 */
router.get('/', asyncHandler(mapaController.listarMapas));

/**
 * GET /mapas/:id
 * Endpoint para buscar um mapa específico pelo ID.
 * Retorna o mapa com todos os seus dados.
 * Exemplo de resposta:
 * {
 *   "id": 1,
 *   "titulo": "Meu Mapa",
 *   "dica": "Dica do mapa",
 *   "descricao": "Descrição do mapa",
 *   "caminho": "Caminho do mapa"
 * }
 */
router.get('/:id', asyncHandler(mapaController.buscarMapaPorId));

/**
 * PUT /mapas/:id
 * Endpoint para atualizar um mapa existente.
 * Exemplo de corpo da requisição:
 * {
 *   "titulo": "Meu Mapa Atualizado",
 *   "dica": "Nova dica",
 *   "descricao": "Nova descrição",
 *   "caminho": "Novo caminho"
 * }
 */
router.put('/:id', asyncHandler(mapaController.atualizarMapa));

/**
 * DELETE /mapas/:id
 * Endpoint para deletar um mapa pelo ID.
 * Retorna uma mensagem de sucesso ou erro.
 */
router.delete('/:id', asyncHandler(mapaController.deletarMapa));

module.exports = router;
