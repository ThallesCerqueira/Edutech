// 1. Importação de módulos necessários
const express = require('express');
const cors = require('cors'); // Para permitir requisições de diferentes origens, por exemplo, do Front
const path = require('path');
const pool = require('./db');

// 2. Inicialização do aplicativo Express
const app = express();

// 3. Configuração de Middlewares
app.use(cors());
app.use(express.json());

// Renderizando a pagina html

const publicPath = path.join(__dirname, '..', 'frontend', 'public');
app.use(express.static(publicPath));

app.use('/images', express.static(path.join(publicPath, 'images')));

// 5. Definição das Rotas

app.post('/mapas', async (req, res) => {

  const { titulo, dica, descricao, caminho} = req.body;

  // Validação simples
  if (!titulo || !dica || !descricao || !caminho) {
    return res.status(400).json({ mensagem: 'Título, dica, descrição e caminho são obrigatórios.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const query = 'INSERT INTO mapa (titulo, dica, descricao, caminho) VALUES ($1, $2, $3, $4) RETURNING id;';
    const values = [titulo, dica, descricao, caminho];
    const result = await client.query(query, values);
    const novoMapaId = result.rows[0].id;
    await client.query('COMMIT');
    res.status(201).json({ mensagem: 'Mapa criado com sucesso.', id: novoMapaId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar o mapa:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  } finally {
    client.release();
  }
});

app.get('/mapas', async (req, res) => {
  try {
    const query = 'SELECT id, titulo FROM mapa ORDER BY id ASC;';
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar os mapas:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
});

app.get('/mapas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'SELECT * FROM mapa WHERE id = $1;';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Mapa não encontrado.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar o mapa:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
});

app.put('/mapas/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, dica, descricao, caminho } = req.body;

  if (!titulo || !dica || !descricao || !caminho) {
    return res.status(400).json({ mensagem: 'Título, dica, descrição e caminho são obrigatórios.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const query = 'UPDATE mapa SET titulo = $1, dica = $2, descricao = $3, caminho = $4 WHERE id = $5;';
    const values = [titulo, dica, descricao, caminho, id];
    const result = await client.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ mensagem: 'Mapa não encontrado para atualização.' });
    }

    await client.query('COMMIT');
    res.status(200).json({ mensagem: 'Mapa atualizado com sucesso.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar o mapa:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  } finally {
    client.release();
  }

});

app.delete('/mapas/:id', async (req, res) => {
  const { id } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const query = 'DELETE FROM mapa WHERE id = $1;';
    const result = await client.query(query, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ mensagem: 'Mapa não encontrado para exclusão.' });
    }

    await client.query('COMMIT');
    res.status(200).json({ mensagem: 'Mapa deletado com sucesso.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao deletar o mapa:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  } finally {
    client.release();
  }
});

app.post('/exercicios', async (req, res) => {
  const { titulo, enunciado, dificuldade, id_mapa, alternativas } = req.body;

  // Validação simples
  if (!titulo || !enunciado || !alternativas || alternativas.length === 0) {
    return res.status(400).json({ mensagem: 'Título, enunciado e alternativas são obrigatórios.' });
  }

  const client = await pool.connect();

  try {

    await client.query('BEGIN');
    const queryExercicio = 'INSERT INTO exercicio (titulo, enunciado, dificuldade, id_mapa) VALUES ($1, $2, $3, $4) RETURNING id;';

    const exercicioValues = [titulo, enunciado, dificuldade, id_mapa];
    const resultExercicio = await client.query(queryExercicio, exercicioValues);
    const novoExercicioId = resultExercicio.rows[0].id;

    const queryAlternativa = 'INSERT INTO alternativa (id_exercicio, correta, descricao) VALUES ($1, $2, $3);';

    for (const alternativa of alternativas) {
      const alternativaValues = [novoExercicioId, alternativa.correta, alternativa.descricao];
      await client.query(queryAlternativa, alternativaValues);
    }

    await client.query('COMMIT');
    res.status(201).json({ mensagem: 'Exercício criado com sucesso.', id: novoExercicioId });
  
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar o exercício:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  
  } finally {
    client.release();
  }

});

app.get('/exercicios', async (req, res) => {
    
    try {
        const query = 'SELECT id, titulo, dificuldade FROM exercicio ORDER BY id ASC;';
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar os exercícios:', err.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }

});

app.get('/exercicios/:id', async (req, res) => {
  
  const { id } = req.params;

  try {

    const exercicioQuery = 'SELECT * FROM exercicio WHERE id = $1;';
    const resultExercicio = await pool.query(exercicioQuery, [id]);

    if (resultExercicio.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Exercício não encontrado.' });
    }

    const alternativasQuery = 'SELECT id, correta, descricao FROM alternativa WHERE id_exercicio = $1 ORDER BY id ASC;';
    const resultAlternativas = await pool.query(alternativasQuery, [id]);

    const exercicioCompleto = resultExercicio.rows[0];
    exercicioCompleto.alternativas = resultAlternativas.rows;

    res.status(200).json(exercicioCompleto);
  } catch (err) {
    console.error('Erro ao buscar o exercício:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });

  }

});

app.put('/exercicios/:id', async (req, res) => {
  
  const { id } = req.params;
  const { titulo, enunciado, dificuldade, id_mapa, alternativas } = req.body;

  if (!titulo || !enunciado || !alternativas || alternativas.length === 0) {
    return res.status(400).json({ mensagem: 'Título, enunciado e alternativas são obrigatórios.' });
  }

  const client = await pool.connect();

  try {

    await client.query('BEGIN');

    const updateExercicioQuery = 'UPDATE exercicio SET titulo = $1, enunciado = $2, dificuldade = $3, id_mapa = $4 WHERE id = $5;';
    await client.query(updateExercicioQuery, [titulo, enunciado, dificuldade, id_mapa, id]);
    
    const deleteAlternativasQuery = 'DELETE FROM alternativa WHERE id_exercicio = $1;';
    await client.query(deleteAlternativasQuery, [id]);

    const insertAlternativaQuery = 'INSERT INTO alternativa (id_exercicio, correta, descricao) VALUES ($1, $2, $3);';
    for (const alternativa of alternativas) {
      await client.query(insertAlternativaQuery, [id, alternativa.correta, alternativa.descricao]);
    }

    await client.query('COMMIT');
    res.status(200).json({ mensagem: 'Exercício atualizado com sucesso.' });

  } catch (err) {

    await client.query('ROLLBACK');
    console.error('Erro ao atualizar o exercício:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });

  } finally {
    client.release();
  }

});

app.delete('/exercicios/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'DELETE FROM exercicio WHERE id = $1;';
        const result = await pool.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Exercício não encontrado para exclusão.' });
        }
        
        res.status(200).json({ mensagem: 'Exercício deletado com sucesso.' });
    } catch (err) {
        console.error('Erro ao deletar o exercício:', err.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
});

// 6. Porta e Inicialização do Servidor
const PORT = 3000; // Definição da porta
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});