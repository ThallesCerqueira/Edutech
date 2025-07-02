// backend/routes/exercicios.js
const express = require('express');
const router = express.Router();
const exercicioController = require('../controllers/exercicioController');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * POST /exercicios
 * Endpoint para criar um novo exercício.
 * Exemplo de corpo da requisição:
 * {
 *   "titulo": "Exercício 1",
 *   "enunciado": "Qual é a capital da França?",
 *   "dificuldade": "Fácil",
 *   "id_mapa": 1,
 *   "alternativas": [
 *     { "correta": true, "descricao": "Paris" },
 *     { "correta": false, "descricao": "Londres" },
 *     { "correta": false, "descricao": "Berlim" },
 *     { "correta": false, "descricao": "Madri" }
 *   ]
 * }
 */
router.post('/', asyncHandler(exercicioController.criarExercicio));

/**
 * GET /exercicios
 * Endpoint para listar todos os exercícios.
 * Retorna um array de objetos com id, titulo e dificuldade.
 * Exemplo de resposta:
 * [
 *   { "id": 1, "titulo": "Exercício 1", "dificuldade": "Fácil" },
 *   { "id": 2, "titulo": "Exercício 2", "dificuldade": "Médio" }
 * ]
 */
router.get('/', asyncHandler(exercicioController.listarExercicios));

/**
 * GET /exercicios/:id
 * Endpoint para buscar um exercício específico pelo ID.
 * Retorna o exercício com suas alternativas.
 * Exemplo de resposta:
 * {
 *   "id": 1,
 *   "titulo": "Exercício 1",
 *   "enunciado": "Qual é a capital da França?",
 *   "dificuldade": "Fácil",
 *   "alternativas": [
 *     { "id": 1, "correta": true, "descricao": "Paris" },
 *     { "id": 2, "correta": false, "descricao": "Londres" },
 *     { "id": 3, "correta": false, "descricao": "Berlim" },
 *     { "id": 4, "correta": false, "descricao": "Madri" }
 *   ]
 * }
 */
router.get('/:id', asyncHandler(exercicioController.buscarExercicioPorId));

/**
 * PUT /exercicios/:id
 * Endpoint para atualizar um exercício existente.
 * Exemplo de corpo da requisição:
 * {
 *   "titulo": "Exercício 1 Atualizado",
 *   "enunciado": "Qual é a capital da Alemanha?",
 *   "dificuldade": "Médio",
 *   "id_mapa": 1,
 *   "alternativas": [
 *     { "correta": true, "descricao": "Berlim" },
 *     { "correta": false, "descricao": "Paris" },
 *     { "correta": false, "descricao": "Londres" },
 *     { "correta": false, "descricao": "Madri" }
 *   ]
 * }
 */
router.put('/:id', asyncHandler(exercicioController.atualizarExercicio));

/**
 * DELETE /exercicios/:id
 * Endpoint para deletar um exercício pelo ID.
 * Retorna uma mensagem de sucesso ou erro.
 */
router.delete('/:id', asyncHandler(exercicioController.deletarExercicio));

module.exports = router;
