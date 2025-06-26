-- ENUM para cargo
CREATE TYPE cargo_enum AS ENUM ('aluno', 'professor', 'admin');

CREATE TABLE mapa (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    dica TEXT,
    descricao TEXT,
    caminho VARCHAR(100)
);

CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(100) NOT NULL,
    cargo cargo_enum NOT NULL
);

CREATE TABLE turma (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

-- Associação Aluno-Turma
CREATE TABLE aluno_turma (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id),
    id_turma INTEGER NOT NULL REFERENCES turma(id)
);

-- Associação Professor-Turma
CREATE TABLE professor_turma (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id),
    id_turma INTEGER NOT NULL REFERENCES turma(id)
);

CREATE TABLE lista (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT
);

CREATE TABLE exercicio (
    id SERIAL PRIMARY KEY,
    id_mapa INTEGER REFERENCES mapa(id),
    titulo VARCHAR(100) NOT NULL,
    enunciado TEXT NOT NULL,
    dificuldade INTEGER
);

-- Associação Lista-Exercicio (Muitos para Muitos)
CREATE TABLE lista_exercicio (
    id SERIAL PRIMARY KEY,
    id_lista INTEGER NOT NULL REFERENCES lista(id) ON DELETE CASCADE,
    id_exercicio INTEGER NOT NULL REFERENCES exercicio(id) ON DELETE CASCADE
);

CREATE TABLE alternativa (
    id SERIAL PRIMARY KEY,
    id_exercicio INTEGER NOT NULL REFERENCES exercicio(id) ON DELETE CASCADE,
    correta BOOLEAN NOT NULL,
    descricao TEXT NOT NULL
);

--
CREATE TABLE resposta (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id),
    id_exercicio INTEGER NOT NULL REFERENCES exercicio(id),
    id_alternativa_escolhida INTEGER NOT NULL REFERENCES alternativa(id),
    foi_correta BOOLEAN NOT NULL,
    data_resolucao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);