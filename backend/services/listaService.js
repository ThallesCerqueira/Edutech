// backend/services/listaService.js
const pool = require('../db');

/**
 * Criar uma nova lista de exercícios
 */
const criarLista = async (titulo, descricao, exercicios) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const resultLista = await client.query(
            'INSERT INTO lista (titulo, descricao) VALUES ($1, $2) RETURNING id;',
            [titulo, descricao]
        );
        const novaListaId = resultLista.rows[0].id;

        for (const exercicio of exercicios) {
            await client.query(
                'INSERT INTO lista_exercicio (id_lista, id_exercicio) VALUES ($1, $2);',
                [novaListaId, exercicio.id]
            );
        }

        await client.query('COMMIT');
        return novaListaId;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Listar todas as listas de exercícios
 */
const listarListas = async () => {
    const query = `
    SELECT lista.id, lista.titulo, lista.descricao, COUNT(le.id_exercicio) AS total_exercicios
    FROM lista
    LEFT JOIN lista_exercicio le ON lista.id = le.id_lista
    GROUP BY lista.id, lista.titulo, lista.descricao
    ORDER BY lista.id ASC;
  `;
    const result = await pool.query(query);
    return result.rows;
};

/**
 * Buscar uma lista específica por ID
 */
const buscarListaPorId = async (id) => {
    const listaResult = await pool.query(
        'SELECT id, titulo, descricao FROM lista WHERE id = $1;',
        [id]
    );

    if (listaResult.rows.length === 0) {
        return null;
    }

    const lista = listaResult.rows[0];
    const exerciciosResult = await pool.query(
        `SELECT exercicio.id, exercicio.titulo, exercicio.enunciado, exercicio.dificuldade
     FROM exercicio
     INNER JOIN lista_exercicio le ON exercicio.id = le.id_exercicio
     WHERE le.id_lista = $1
     ORDER BY exercicio.id ASC;`,
        [id]
    );

    lista.exercicios = exerciciosResult.rows;
    return lista;
};

/**
 * Atualizar uma lista existente
 */
const atualizarLista = async (id, titulo, descricao, exercicios) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await client.query(
            'UPDATE lista SET titulo = $1, descricao = $2 WHERE id = $3;',
            [titulo, descricao, id]
        );

        await client.query('DELETE FROM lista_exercicio WHERE id_lista = $1;', [id]);

        for (const exercicio of exercicios) {
            await client.query(
                'INSERT INTO lista_exercicio (id_lista, id_exercicio) VALUES ($1, $2);',
                [id, exercicio.id]
            );
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Deletar uma lista
 */
const deletarLista = async (id) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const result = await client.query('DELETE FROM lista WHERE id = $1;', [id]);
        if (result.rowCount === 0) {
            return false;
        }

        await client.query('DELETE FROM lista_exercicio WHERE id_lista = $1;', [id]);
        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    criarLista,
    listarListas,
    buscarListaPorId,
    atualizarLista,
    deletarLista
};
