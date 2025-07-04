// backend/routes/turmas.js
const express = require('express');
const router = express.Router();
const turmaController = require('../controllers/turmaController');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * POST /turmas
 * Endpoint para criar uma nova turma.
 * Exemplo de corpo da requisição:
 * {
 *   "nome": "Turma A"
 * }
 */
router.post('/', asyncHandler(turmaController.criarTurma));

/**
 * GET /turmas
 * Endpoint para listar todas as turmas.
 */
router.get('/', asyncHandler(turmaController.listarTurmas));

/**
 * GET /turmas/:id
 * Endpoint para buscar uma turma específica por ID.
 */
router.get('/:id', asyncHandler(turmaController.buscarTurmaPorId));

/**
 * PUT /turmas/:id
 * Endpoint para atualizar uma turma.
 * Exemplo de corpo da requisição:
 * {
 *   "nome": "Turma B"
 * }
 */
router.put('/:id', asyncHandler(turmaController.atualizarTurma));

/**
 * DELETE /turmas/:id
 * Endpoint para deletar uma turma.
 */
router.delete('/:id', asyncHandler(turmaController.deletarTurma));

/**
 * POST /turmas/:id/alunos
 * Endpoint para adicionar um aluno a uma turma.
 * Exemplo de corpo da requisição:
 * {
 *   "id_usuario": 1
 * }
 */
router.post('/:id/alunos', asyncHandler(turmaController.adicionarAluno));

/**
 * DELETE /turmas/:id/alunos/:id_usuario
 * Endpoint para remover um aluno de uma turma.
 */
router.delete('/:id/alunos/:id_usuario', asyncHandler(turmaController.removerAluno));

/**
 * POST /turmas/:id/professores
 * Endpoint para adicionar um professor a uma turma.
 * Exemplo de corpo da requisição:
 * {
 *   "id_usuario": 1
 * }
 */
router.post('/:id/professores', asyncHandler(turmaController.adicionarProfessor));

/**
 * DELETE /turmas/:id/professores/:id_usuario
 * Endpoint para remover um professor de uma turma.
 */
router.delete('/:id/professores/:id_usuario', asyncHandler(turmaController.removerProfessor));

/**
 * GET /turmas/:id/alunos
 * Endpoint para listar alunos de uma turma.
 */
router.get('/:id/alunos', asyncHandler(turmaController.listarAlunosTurma));

/**
 * GET /turmas/:id/professores
 * Endpoint para listar professores de uma turma.
 */
router.get('/:id/professores', asyncHandler(turmaController.listarProfessoresTurma));

/**
 * GET /turmas/minhas
 * Endpoint para buscar turmas do usuário logado.
 */
router.get('/usuario/minhas', asyncHandler(turmaController.buscarMinhasTurmas));

/**
 * POST /turmas/entrar
 * Endpoint para entrar em uma turma usando código de convite.
 * Exemplo de corpo da requisição:
 * {
 *   "codigo_convite": "ABC123XY"
 * }
 */
router.post('/entrar', asyncHandler(turmaController.entrarNaTurma));

module.exports = router;
