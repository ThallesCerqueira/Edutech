const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorHandler } = require('./middlewares/errorHandler');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos
const publicPath = path.join(__dirname, '..', 'frontend', 'public');
app.use(express.static(publicPath));
app.use('/images', express.static(path.join(publicPath, 'images')));

// Rotas
app.use('/mapas', require('./routes/mapas'));
app.use('/exercicios', require('./routes/exercicios'));
app.use('/listas', require('./routes/listas'));
app.use('/usuarios', require('./routes/usuarios'));
// app.use('/respostas', require('./routes/respostas'));

// Middleware de tratamento de erros (deve vir por último)
app.use(errorHandler);

// Inicializa servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend rodando em http://localhost:${PORT}`);
  console.log('Estrutura MVC carregada com sucesso!');
});
