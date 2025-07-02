// backend/routes/listas.js
const express = require('express');
const router = express.Router();
const listaController = require('../controllers/listaController');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * POST /listas
 * Endpoint para criar uma nova lista de exercícios.
 * Exemplo de corpo da requisição:
 * {
 *   "titulo": "Minha Lista",
 *   "descricao": "Descrição da lista",
 *   "exercicios": [{ "id": 1 }, { "id": 2 }]
 * }
 */
router.post('/', asyncHandler(listaController.criarLista));

/**
 * GET /listas
 * Endpoint para listar todas as listas de exercícios.
 * Retorna um array de objetos com id, titulo, descricao e total_exercicios.
 * Exemplo de resposta:
 * [
 *   { "id": 1, "titulo": "Lista 1", "descricao": "Descrição 1", "total_exercicios": 3 },
 *   { "id": 2, "titulo": "Lista 2", "descricao": "Descrição 2", "total_exercicios": 5 }
 * ]    
 */
router.get('/', asyncHandler(listaController.listarListas));

/**
 * GET /listas/:id
 * Endpoint para buscar uma lista de exercícios específica pelo ID.
 * Retorna o objeto da lista com seus exercícios.
 * Exemplo de resposta:
 * {
 *   "id": 1,
 *   "titulo": "Lista 1",
 *   "descricao": "Descrição 1",
 *   "exercicios": [
 *     { "id": 1, "titulo": "Exercício 1", "enunciado": "Enunciado 1", "dificuldade": "Fácil" },
 *     { "id": 2, "titulo": "Exercício 2", "enunciado": "Enunciado 2", "dificuldade": "Médio" }
 *   ]
 * }    
 */
router.get('/:id', asyncHandler(listaController.buscarListaPorId));

/**
 * PUT /listas/:id
 * Endpoint para atualizar uma lista de exercícios existente.
 * Exemplo de corpo da requisição:
 * {
 *   "titulo": "Lista Atualizada",
 *   "descricao": "Descrição atualizada",
 *   "exercicios": [{ "id": 1 }, { "id": 2 }]
 * }
 * Retorna uma mensagem de sucesso ou erro.
 */
router.put('/:id', asyncHandler(listaController.atualizarLista));

/**
 * DELETE /listas/:id
 * Endpoint para deletar uma lista de exercícios pelo ID.
 * Retorna uma mensagem de sucesso ou erro.
 */
router.delete('/:id', asyncHandler(listaController.deletarLista));

module.exports = router;
