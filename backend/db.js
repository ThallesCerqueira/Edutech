// 1. Importa o módulo 'Pool' do pacote 'pg'
const { Pool } = require('pg');

// 2. Cria um novo "pool" de conexões com o banco de dados
const pool = new Pool({
  user: 'usuario',       // Ex: 'postgres'
  host: 'localhost',
  database: 'meubanco',     // O nome do banco que você criou
  password: 'senha',
  port: 5432,
});

// 3. Exporta uma função 'query' que usa o pool para executar consultas
// Isso permite que a gente use a mesma função de consulta em qualquer parte do nosso código
module.exports = pool;