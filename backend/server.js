// 1. Importação de módulos necessários
const express = require('express');
const cors = require('cors'); // Para permitir requisições de diferentes origens, por exemplo, do Front


// 2. Inicialização do aplicativo Express
const app = express();

// 3. Configuração de Middlewares
app.use(cors());
app.use(express.json());

//rederizando a pagina html
app.use(express.static('./')); 
app.use('/images', express.static('images'));


// 4. Armazenamento de Dados (em memória por enquanto)
let exercicios = [
  {
    id: 1,
    titulo: "Geomatria plana",
    descricao: "Qual a area do retangulo",
    mapaSelecionado: "Geometria",
    nivelDificuldade: "Fácil",
    alternativas: ["190", "220", "450", "1000"]
  },
  {
    id: 2, //dont show
    titulo: "Matemática Básica",
    descricao: "Quanto é 9 + 6?",
    mapaSelecionado: "Nenhum", //show the same image for every exercice;
    nivelDificuldade: "Fácil",
    alternativas: ["14", "15", "16", "17"] //dont show
  }
];


let proximoId = 1; // id para identificar cada elemento

// Adicionando um novo exercicio
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

//Apenas exibir os exerciciositais na tela
app.get('/exercicios', (req, res) => {
  //colocando conteudo principal de exercicio em um novo array
    const exerciciosResumidos = exercicios.map(({ id, titulo, nivelDificuldade }) => ({
        id,
        titulo,
        nivelDificuldade // Para possiveis filtros ou ordenações futuras
    }));
    //enviando o status 200 afirmando que esta ok, e junto o novo arquivoi json filtrado
    res.status(200).json(exerciciosResumidos);
});

//find exercicio for id;
app.get('/exercicios/:id', (req, res) => {
  const idParaBuscar = parseInt(req.params.id);
  const exercicio = exercicios.find(e => e.id === idParaBuscar);

  if (exercicio) {
    res.status(200).json(exercicio);
  } else {
    res.status(404).json({ mensagem: 'Exercício não encontrado.' });
  }
});

//Edit exercice
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

//Delet exercice
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