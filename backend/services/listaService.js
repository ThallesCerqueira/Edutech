// backend/services/listaService.js
const pool = require('../db');

/**
 * Criar uma nova lista de exercícios
 */
const criarLista = async (titulo, descricao, exercicios, id_turma) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const resultLista = await client.query(
            'INSERT INTO lista (titulo, descricao, id_turma) VALUES ($1, $2, $3) RETURNING id;',
            [titulo, descricao, id_turma]
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
 * Listar todas as listas de exercícios (com filtro opcional por turma)
 */
const listarListas = async (id_turma = null) => {
    let query = `
        SELECT lista.id, lista.titulo, lista.descricao, lista.id_turma, COUNT(le.id_exercicio) AS total_exercicios
        FROM lista
        LEFT JOIN lista_exercicio le ON lista.id = le.id_lista
    `;

    const params = [];
    if (id_turma) {
        query += ' WHERE lista.id_turma = $1';
        params.push(id_turma);
    }

    query += `
        GROUP BY lista.id, lista.titulo, lista.descricao, lista.id_turma
        ORDER BY lista.id ASC;
    `;

    const result = await pool.query(query, params);
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
const atualizarLista = async (id, titulo, descricao, exercicios, id_turma) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await client.query(
            'UPDATE lista SET titulo = $1, descricao = $2, id_turma = $3 WHERE id = $4;',
            [titulo, descricao, id_turma, id]
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

/**
 * Listar exercícios de uma lista específica
 */
const listarExerciciosDaLista = async (id_lista) => {
    const result = await pool.query(`
        SELECT e.id, e.titulo, e.enunciado, e.dificuldade, e.id_mapa
        FROM exercicio e
        INNER JOIN lista_exercicio le ON e.id = le.id_exercicio
        WHERE le.id_lista = $1
        ORDER BY e.id ASC;
    `, [id_lista]);
    return result.rows;
};

/**
 * Adicionar exercício a uma lista
 */
const adicionarExercicioNaLista = async (id_lista, id_exercicio) => {
    // Verificar se o exercício já está na lista
    const exists = await pool.query(
        'SELECT 1 FROM lista_exercicio WHERE id_lista = $1 AND id_exercicio = $2;',
        [id_lista, id_exercicio]
    );

    if (exists.rows.length > 0) {
        throw new Error('Exercício já está na lista');
    }

    await pool.query(
        'INSERT INTO lista_exercicio (id_lista, id_exercicio) VALUES ($1, $2);',
        [id_lista, id_exercicio]
    );
};

module.exports = {
    criarLista,
    listarListas,
    buscarListaPorId,
    atualizarLista,
    deletarLista,
    listarExerciciosDaLista,
    adicionarExercicioNaLista
};
