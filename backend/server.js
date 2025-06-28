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

// ROTAS LISTA DE MAPAS
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

// ROTAS DE EXERCÍCIOS
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

// ROTAS LISTA DE EXERCÍCIOS
app.post('/lista-exercicios', async (req, res) => {
 const {titulo, descricao, exercicios } = req.body;

 // Validação simples
 if (!titulo || !descricao || !exercicios || exercicios.length === 0) {
   return res.status(400).json({ mensagem: 'Título, descrição e exercícios são obrigatórios.' });
 }

  const client = await pool.connect();
 try {
    await client.query('BEGIN');
    const queryLista = 'INSERT INTO lista (titulo, descricao) VALUES ($1, $2) RETURNING id;';
    const valuesLista = [titulo, descricao];
    const resultLista = await client.query(queryLista, valuesLista);
    const novaListaId = resultLista.rows[0].id;

    const queryExercicioLista = 'INSERT INTO lista_exercicio (id_lista, id_exercicio) VALUES ($1, $2);';
    for (const exercicio of exercicios) {
      const valuesExercicio = [novaListaId, exercicio.id];
      await client.query(queryExercicioLista, valuesExercicio);
    }
    await client.query('COMMIT');
    res.status(201).json({ mensagem: 'Lista de exercícios criada com sucesso.', id: novaListaId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar a lista de exercícios:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  } finally {
    client.release();
  }
} );

app.get('/lista-exercicios', async (req, res) => {
  try {
    const query = `SELECT lista.id, lista.titulo, lista.descricao, COUNT(le.id_exercicio) AS total_exercicios
                   FROM lista
                   LEFT JOIN lista_exercicio le ON lista.id = le.id_lista
                    GROUP BY lista.id, lista.titulo, lista.descricao
                    ORDER BY lista.id ASC;`;

    const result = await pool.query(query);
    res.status(200).json(result.rows);

  } catch (err) {
    console.error('Erro ao buscar as listas de exercícios:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
});

app.get('/lista-exercicios/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Busca a lista pelo id
    const listaQuery = `
      SELECT id, titulo, descricao
      FROM lista
      WHERE id = $1;
    `;
    const listaResult = await pool.query(listaQuery, [id]);

    if (listaResult.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Lista de exercícios não encontrada.' });
    }

    const lista = listaResult.rows[0];

    // Busca os exercícios associados à lista
    const exerciciosQuery = `
      SELECT exercicio.id, exercicio.titulo, exercicio.enunciado, exercicio.dificuldade
      FROM exercicio
      INNER JOIN lista_exercicio le ON exercicio.id = le.id_exercicio
      WHERE le.id_lista = $1
      ORDER BY exercicio.id ASC;
    `;
    const exerciciosResult = await pool.query(exerciciosQuery, [id]);
    lista.exercicios = exerciciosResult.rows;

    res.status(200).json(lista);
  } catch (err) {
    console.error('Erro ao buscar a lista de exercícios:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
});

app.put('/lista-exercicios/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, exercicios } = req.body;

  if (!titulo || !descricao || !exercicios || exercicios.length === 0) {
    return res.status(400).json({ mensagem: 'Título, descrição e exercícios são obrigatórios.' });
  }
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const updateListaQuery = 'UPDATE lista SET titulo = $1, descricao = $2 WHERE id = $3;';
    await client.query(updateListaQuery, [titulo, descricao, id]);

    const deleteExerciciosQuery = 'DELETE FROM lista_exercicio WHERE id_lista = $1;';
    await client.query(deleteExerciciosQuery, [id]);

    const insertExercicioQuery = 'INSERT INTO lista_exercicio (id_lista, id_exercicio) VALUES ($1, $2);';
    for (const exercicio of exercicios) {
      await client.query(insertExercicioQuery, [id, exercicio.id]);
    }
    await client.query('COMMIT');
    res.status(200).json({ mensagem: 'Lista de exercícios atualizada com sucesso.' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar a lista de exercícios:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  } finally {
    client.release();
  }

});

app.delete('/lista-exercicios/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');  
    const deleteListaQuery = 'DELETE FROM lista WHERE id = $1;';
    const result = await client.query(deleteListaQuery, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ mensagem: 'Lista de exercícios não encontrada para exclusão.' });
    }
    const deleteExerciciosQuery = 'DELETE FROM lista_exercicio WHERE id_lista = $1;';
    await client.query(deleteExerciciosQuery, [id]);
    await client.query('COMMIT');
    res.status(200).json({ mensagem: 'Lista de exercícios deletada com sucesso.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao deletar a lista de exercícios:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
  finally {
    client.release();
  }
});

// ROTAS DE USUÁRIOS
app.post('/usuarios', async (req, res) => {
  const { nome, email, senha, cargo } = req.body;

  if (!nome || !email || !senha || !cargo) {
    return res.status(400).json({ mensagem: 'Todos os campos (nome, email, senha, cargo) são obrigatórios.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query = `
      INSERT INTO usuario (nome, email, senha, cargo) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, nome, email, cargo;
    `;

    const values = [nome, email, senha, cargo];
    const result = await client.query(query, values);

    await client.query('COMMIT');
    res.status(201).json({
      mensagem: 'Usuário criado com sucesso!',
      usuarioId: result.rows[0].id
    });

  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ mensagem: 'Este email já está cadastrado.' });
    }
    console.error('Erro ao criar usuário:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });

  } finally {
    client.release();
  }
});

app.get('/usuarios', async (req, res) => {
  try {
    const query = 'SELECT id, nome, email, cargo FROM usuario ORDER BY id ASC;';
    const result = await pool.query(query);
    res.status(200).json(result.rows);

  } catch (err) {
    console.error('Erro ao buscar usuários:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }

});

app.get('/usuarios/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'SELECT id, nome, email, cargo FROM usuario WHERE id = $1;';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }
    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error('Erro ao buscar usuário:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }

});

app.put('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, senha, cargo } = req.body;

  if (!nome || !email || !senha || !cargo) {
    return res.status(400).json({ mensagem: 'Todos os campos (nome, email, senha, cargo) são obrigatórios.' });
  }
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const query = `
      UPDATE usuario 
      SET nome = $1, email = $2, senha = $3, cargo = $4
      WHERE id = $5;
    `;
    const values = [nome, email, senha, cargo, id];
    const result = await client.query(query, values);

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ mensagem: 'Usuário não encontrado para atualização.' });
    }

    await client.query('COMMIT');
    res.status(200).json({ mensagem: 'Usuário atualizado com sucesso.' });

  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ mensagem: 'Este email já está cadastrado.' });
    }
    console.error('Erro ao atualizar usuário:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });

  } finally {
    client.release();
  }
});

app.delete('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const query = 'DELETE FROM usuario WHERE id = $1;';
    const result = await client.query(query, [id]);
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ mensagem: 'Usuário não encontrado para exclusão.' });
    }
    await client.query('COMMIT');
    res.status(200).json({ mensagem: 'Usuário deletado com sucesso.' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao deletar usuário:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });

  } finally {
    client.release();
  }
});


//ROTAS ADICIONAR RESPOSTAS

//PARTE DO GABRIEL

//TODAS AS RESPOSTAS DE UMA LISTA - MELHORAR A DISPOSIÇÃO DOS DADOS
app.get('/respostas/lista/:id', async (req, res) => {
  const listaId = req.params.id;

  try {
    const query = `
      SELECT r.id, r.id_usuario, u.nome AS nome_usuario,
             r.id_exercicio, e.titulo AS titulo_exercicio,
             r.id_alternativa_escolhida, a.descricao AS descricao_alternativa,
             r.foi_correta, r.data_resolucao
      FROM resposta r
      JOIN usuario u ON r.id_usuario = u.id
      JOIN exercicio e ON r.id_exercicio = e.id
      JOIN alternativa a ON r.id_alternativa_escolhida = a.id
      JOIN lista_exercicio le ON e.id = le.id_exercicio
      WHERE le.id_lista = $1
      ORDER BY r.data_resolucao DESC;
    `;

    const result = await pool.query(query, [listaId]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar respostas da lista:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
});


//LISTA A RESPOSTA DE UM EXERCICIO ESPECIFICO
app.get('/respostas/exercicio/:id', async (req, res) => {
  const exercicioId = req.params.id;

  try {
    const query = `
      SELECT r.id, r.id_usuario, u.nome AS nome_usuario,
             r.id_alternativa_escolhida, a.descricao AS descricao_alternativa,
             r.foi_correta, r.data_resolucao
      FROM resposta r
      JOIN usuario u ON r.id_usuario = u.id
      JOIN alternativa a ON r.id_alternativa_escolhida = a.id
      WHERE r.id_exercicio = $1
      ORDER BY r.data_resolucao DESC;
    `;

    const result = await pool.query(query, [exercicioId]);
    res.status(200).json(result.rows);

  } catch (err) {
    console.error('Erro ao buscar respostas do exercício:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
});

//EDITAR A RESPOSTA 
app.put('/respostas/:id', async (req, res) => {
  const respostaId = req.params.id;
  const { id_usuario, id_exercicio, id_alternativa_escolhida, foi_correta } = req.body;

  if (!id_usuario || !id_exercicio || !id_alternativa_escolhida || typeof foi_correta !== 'boolean') {
    return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const query = `
      UPDATE resposta
      SET id_usuario = $1,
          id_exercicio = $2,
          id_alternativa_escolhida = $3,
          foi_correta = $4,
          data_resolucao = CURRENT_TIMESTAMP
      WHERE id = $5;
    `;
    const values = [id_usuario, id_exercicio, id_alternativa_escolhida, foi_correta, respostaId];
    const result = await client.query(query, values);

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ mensagem: 'Resposta não encontrada para atualização.' });
    }

    await client.query('COMMIT');
    res.status(200).json({ mensagem: 'Resposta atualizada com sucesso.' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar resposta:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  } finally {
    client.release();
  }
});

//DELETA RESPOSTA 
app.delete('/respostas/:id', async (req, res) => {
  const respostaId = req.params.id;

  try {
    const result = await pool.query('DELETE FROM resposta WHERE id = $1;', [respostaId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ mensagem: 'Resposta não encontrada para exclusão.' });
    }

    res.status(200).json({ mensagem: 'Resposta deletada com sucesso.' });

  } catch (err) {
    console.error('Erro ao deletar resposta:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
});

//ROTA ADICIONAR RESPOSTA 
app.post('/respostas/adicionar', async (req, res) => {
  const { id_usuario, id_exercicio, id_alternativa_escolhida, foi_correta } = req.body;

  if (!id_usuario || !id_exercicio || !id_alternativa_escolhida || typeof foi_correta !== 'boolean') {
    return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
  }

  try {
    const query = `
      INSERT INTO resposta (id_usuario, id_exercicio, id_alternativa_escolhida, foi_correta)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;

    const values = [id_usuario, id_exercicio, id_alternativa_escolhida, foi_correta];
    const result = await pool.query(query, values);

    res.status(201).json({
      mensagem: 'Resposta adicionada com sucesso.',
      id: result.rows[0].id
    });

  } catch (err) {
    console.error('Erro ao adicionar resposta:', err.message);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
});





// 6. Porta e Inicialização do Servidor
const PORT = 3000; // Definição da porta
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});