// backend/routes/respostas.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * POST /respostas
 * Endpoint para salvar uma resposta de exercício.
 * Exemplo de corpo da requisição:
 * {
 *   "id_usuario": 1,
 *   "id_exercicio": 2,
 *   "resposta": "Minha resposta"
 * }
 * Retorna uma mensagem de sucesso ou erro.
 */
router.post('/', async (req, res) => {
  const { id_usuario, id_exercicio, resposta } = req.body;
  try {
    await pool.query(
      'INSERT INTO resposta (id_usuario, id_exercicio, resposta) VALUES ($1, $2, $3);',
      [id_usuario, id_exercicio, resposta]
    );
    res.status(201).json({ mensagem: 'Resposta salva com sucesso.' });
  } catch (err) {
    console.error('Erro ao salvar resposta:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
});

/**
 * GET /respostas/:id_usuario/:id_exercicio
 * Endpoint para buscar uma resposta de exercício pelo ID do usuário e ID do exercício.
 * Retorna a resposta se encontrada, ou uma mensagem de erro.
 */
router.get('/:id_usuario/:id_exercicio', async (req, res) => {
  const { id_usuario, id_exercicio } = req.params;
  try {
    const result = await pool.query(
      'SELECT resposta FROM resposta WHERE id_usuario = $1 AND id_exercicio = $2;',
      [id_usuario, id_exercicio]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Resposta não encontrada.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar resposta:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
});

module.exports = router;