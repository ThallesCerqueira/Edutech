// 1. Importação de módulos necessários
const express = require('express');
const cors = require('cors'); // Para permitir requisições de diferentes origens, por exemplo, do Front
const path = require('path');

// 2. Inicialização do aplicativo Express
const app = express();

// 3. Configuração de Middlewares
app.use(cors());
app.use(express.json());

// Renderizando a pagina html

const publicPath = path.join(__dirname, '..', 'frontend', 'public');
app.use(express.static(publicPath));

app.use('/images', express.static(path.join(publicPath, 'images')));

// 4. Armazenamento de Dados (em memória por enquanto)
let exercicios = [];


let proximoId = 1; // Contador simples para gerar IDs únicos

// 5. Definição das Rotas
app.post('/exercicios', (req, res) => {
  const { titulo, descricao, mapaSelecionado, alternativas, nivelDificuldade } = req.body;

  // Validação simples
  if (!titulo || !alternativas || alternativas.length === 0) {
    return res.status(400).json({ mensagem: 'Título e pelo menos uma alternativa são obrigatórios.' });
  }

  const novoExercicio = {
    id: proximoId++,
    titulo,
    descricao,
    mapaSelecionado,
    nivelDificuldade,
    alternativas
  };

  exercicios.push(novoExercicio);
  res.status(201).json({ mensagem: 'Exercício criado com sucesso.' });

});

app.get('/exercicios', (req, res) => {
    const exerciciosResumidos = exercicios.map(({ id, titulo, nivelDificuldade }) => ({
        id,
        titulo,
        nivelDificuldade // Para possiveis filtros ou ordenações futuras
    }));
    res.status(200).json(exerciciosResumidos);
});

app.get('/exercicios/:id', (req, res) => {
  const idParaBuscar = parseInt(req.params.id);
  const exercicio = exercicios.find(e => e.id === idParaBuscar);

  if (exercicio) {
    res.status(200).json(exercicio);
  } else {
    res.status(404).json({ mensagem: 'Exercício não encontrado.' });
  }
});

app.put('/exercicios/:id', (req, res) => {
  const idParaBuscar = parseInt(req.params.id);
  const { titulo, descricao, mapaSelecionado, nivelDificuldade, alternativas } = req.body;

  const indiceExercicio = exercicios.findIndex(e => e.id === idParaBuscar);

  if (indiceExercicio === -1) {
    return res.status(404).json({ mensagem: 'Exercício não encontrado para atualização.' });
  }

  // Atualiza o exercício
  exercicios[indiceExercicio] = {
    ...exercicios[indiceExercicio],
    titulo: titulo !== undefined ? titulo : exercicios[indiceExercicio].titulo,
    descricao: descricao !== undefined ? descricao : exercicios[indiceExercicio].descricao,
    mapaSelecionado: mapaSelecionado !== undefined ? mapaSelecionado : exercicios[indiceExercicio].mapaSelecionado,
    nivelDificuldade: nivelDificuldade !== undefined ? nivelDificuldade : exercicios[indiceExercicio].nivelDificuldade,
    alternativas: alternativas !== undefined ? alternativas : exercicios[indiceExercicio].alternativas,
  };

  res.status(200).json({ mensagem: 'Exercício atualizado com sucesso.' });

});

app.delete('/exercicios/:id', (req, res) => {
  const idParaDeletar = parseInt(req.params.id);
  const tamanhoOriginal = exercicios.length;
  exercicios = exercicios.filter(e => e.id !== idParaDeletar); // Filtra o array para remover o exercício com o ID especificado

  if (exercicios.length < tamanhoOriginal) {
    res.status(200).json({ mensagem: 'Exercício deletado com sucesso.' });
  } else {
    res.status(404).json({ mensagem: 'Exercício não encontrado para exclusão.' });
  }
});

// 6. Porta e Inicialização do Servidor
const PORT = 3000; // Definição da porta
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});