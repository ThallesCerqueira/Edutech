// backend/services/mapaService.js
const pool = require('../db');

/**
 * Service para criar um novo mapa
 */
const criarMapa = async (dadosMapa) => {
    const { titulo, dica, descricao, caminho } = dadosMapa;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const query = 'INSERT INTO mapa (titulo, dica, descricao, caminho) VALUES ($1, $2, $3, $4) RETURNING id;';
        const values = [titulo, dica, descricao, caminho];
        const result = await client.query(query, values);

        const novoMapaId = result.rows[0].id;

        await client.query('COMMIT');
        return novoMapaId;
    } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`Erro ao criar mapa: ${error.message}`);
    } finally {
        client.release();
    }
};

/**
 * Service para listar todos os mapas
 */
const listarMapas = async () => {
    const client = await pool.connect();
    try {
        const query = 'SELECT id, titulo, descricao FROM mapa ORDER BY id;';
        const result = await client.query(query);
        return result.rows;
    } catch (error) {
        throw new Error(`Erro ao listar mapas: ${error.message}`);
    } finally {
        client.release();
    }
};

/**
 * Service para buscar um mapa por ID
 */
const buscarMapaPorId = async (id) => {
    const client = await pool.connect();
    try {
        const query = 'SELECT * FROM mapa WHERE id = $1;';
        const result = await client.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    } catch (error) {
        throw new Error(`Erro ao buscar mapa: ${error.message}`);
    } finally {
        client.release();
    }
};

/**
 * Service para atualizar um mapa
 */
const atualizarMapa = async (id, dadosAtualizacao) => {
    const { titulo, dica, descricao, caminho } = dadosAtualizacao;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Verifica se o mapa existe
        const mapaExistente = await buscarMapaPorId(id);
        if (!mapaExistente) {
            return null;
        }

        // Prepara os campos para atualização (apenas os que foram fornecidos)
        const camposAtualizar = [];
        const valores = [];
        let contador = 1;

        if (titulo !== undefined) {
            camposAtualizar.push(`titulo = $${contador}`);
            valores.push(titulo);
            contador++;
        }

        if (dica !== undefined) {
            camposAtualizar.push(`dica = $${contador}`);
            valores.push(dica);
            contador++;
        }

        if (descricao !== undefined) {
            camposAtualizar.push(`descricao = $${contador}`);
            valores.push(descricao);
            contador++;
        }

        if (caminho !== undefined) {
            camposAtualizar.push(`caminho = $${contador}`);
            valores.push(caminho);
            contador++;
        }

        if (camposAtualizar.length === 0) {
            return mapaExistente; // Nenhuma atualização necessária
        }

        valores.push(id);
        const query = `UPDATE mapa SET ${camposAtualizar.join(', ')} WHERE id = $${contador} RETURNING *;`;

        const result = await client.query(query, valores);

        await client.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`Erro ao atualizar mapa: ${error.message}`);
    } finally {
        client.release();
    }
};

/**
 * Service para deletar um mapa
 */
const deletarMapa = async (id) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Verifica se o mapa existe
        const mapaExistente = await buscarMapaPorId(id);
        if (!mapaExistente) {
            return false;
        }

        // Deleta o mapa
        const query = 'DELETE FROM mapa WHERE id = $1;';
        await client.query(query, [id]);

        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`Erro ao deletar mapa: ${error.message}`);
    } finally {
        client.release();
    }
};

module.exports = {
    criarMapa,
    listarMapas,
    buscarMapaPorId,
    atualizarMapa,
    deletarMapa
};
