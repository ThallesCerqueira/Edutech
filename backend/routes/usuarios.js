// backend/routes/usuarios.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * POST /usuarios/cadastro
 * Endpoint para cadastrar um novo usuário.
 */
router.post('/cadastro', asyncHandler(usuarioController.cadastrarUsuario));

/**
 * POST /usuarios/login
 * Endpoint para fazer login do usuário.
 */
router.post('/login', asyncHandler(usuarioController.loginUsuario));

/**
 * GET /usuarios/perfil
 * Endpoint para obter perfil do usuário logado.
 */
router.get('/perfil', asyncHandler(usuarioController.obterPerfil));

/**
 * PUT /usuarios/perfil
 * Endpoint para atualizar perfil do usuário logado.
 */
router.put('/perfil', asyncHandler(usuarioController.atualizarPerfil));

/**
 * GET /usuarios
 * Endpoint para listar todos os usuários (apenas admin).
 */
router.get('/', asyncHandler(usuarioController.listarUsuarios));

/**
 * DELETE /usuarios/:id
 * Endpoint para deletar um usuário por ID (apenas admin).
 */
router.delete('/:id', asyncHandler(usuarioController.deletarUsuario));

module.exports = router;
