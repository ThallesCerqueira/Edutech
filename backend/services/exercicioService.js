// backend/services/exercicioService.js
const pool = require('../db');

class ExercicioService {
    /**
     * Cria um novo exercício com suas alternativas e associa a uma turma via lista
     */
    async criarExercicio({ titulo, enunciado, dificuldade, id_mapa, alternativas, id_turma }) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Cria o exercício
            const result = await client.query(
                'INSERT INTO exercicio (titulo, enunciado, dificuldade, id_mapa) VALUES ($1, $2, $3, $4) RETURNING id;',
                [titulo, enunciado, dificuldade, id_mapa]
            );

            const exercicioId = result.rows[0].id;

            // Cria as alternativas
            for (const alternativa of alternativas) {
                await client.query(
                    'INSERT INTO alternativa (id_exercicio, correta, descricao) VALUES ($1, $2, $3);',
                    [exercicioId, alternativa.correta, alternativa.descricao]
                );
            }

            // Se foi fornecido id_turma, associa o exercício a uma lista dessa turma
            if (id_turma) {
                // Busca uma lista existente na turma ou cria uma nova
                let listaResult = await client.query(
                    'SELECT id FROM lista WHERE id_turma = $1 AND titulo = $2 LIMIT 1;',
                    [id_turma, 'Exercícios Gerais']
                );

                let listaId;
                if (listaResult.rows.length === 0) {
                    // Cria uma lista padrão para exercícios da turma
                    const novaListaResult = await client.query(
                        'INSERT INTO lista (titulo, descricao, id_turma) VALUES ($1, $2, $3) RETURNING id;',
                        ['Exercícios Gerais', 'Lista automática para exercícios da turma', id_turma]
                    );
                    listaId = novaListaResult.rows[0].id;
                } else {
                    listaId = listaResult.rows[0].id;
                }

                // Associa o exercício à lista
                await client.query(
                    'INSERT INTO lista_exercicio (id_lista, id_exercicio) VALUES ($1, $2);',
                    [listaId, exercicioId]
                );
            }

            await client.query('COMMIT');
            return { id: exercicioId, titulo, enunciado, dificuldade, id_mapa };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Lista todos os exercícios (sem alternativas)
     */
    async listarExercicios() {
        const result = await pool.query(
            'SELECT id, titulo, dificuldade FROM exercicio ORDER BY id ASC;'
        );
        return result.rows;
    }

    /**
     * Busca um exercício específico com suas alternativas
     */
    async buscarExercicioPorId(id) {
        const exercicioResult = await pool.query(
            'SELECT * FROM exercicio WHERE id = $1;',
            [id]
        );

        if (exercicioResult.rows.length === 0) {
            return null;
        }

        const alternativasResult = await pool.query(
            'SELECT id, correta, descricao FROM alternativa WHERE id_exercicio = $1 ORDER BY id ASC;',
            [id]
        );

        const exercicio = exercicioResult.rows[0];
        exercicio.alternativas = alternativasResult.rows;

        return exercicio;
    }

    /**
     * Atualiza um exercício existente
     */
    async atualizarExercicio(id, { titulo, enunciado, dificuldade, id_mapa, alternativas }) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Atualiza o exercício
            const exercicioResult = await client.query(
                'UPDATE exercicio SET titulo = $1, enunciado = $2, dificuldade = $3, id_mapa = $4 WHERE id = $5 RETURNING *;',
                [titulo, enunciado, dificuldade, id_mapa, id]
            );

            if (exercicioResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return null;
            }

            // Remove alternativas antigas
            await client.query('DELETE FROM alternativa WHERE id_exercicio = $1;', [id]);

            // Insere novas alternativas
            for (const alternativa of alternativas) {
                await client.query(
                    'INSERT INTO alternativa (id_exercicio, correta, descricao) VALUES ($1, $2, $3);',
                    [id, alternativa.correta, alternativa.descricao]
                );
            }

            await client.query('COMMIT');
            return exercicioResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Deleta um exercício pelo ID
     */
    async deletarExercicio(id) {
        const result = await pool.query('DELETE FROM exercicio WHERE id = $1;', [id]);
        return result.rowCount > 0;
    }

    /**
     * Verifica se um exercício existe
     */
    async exercicioExiste(id) {
        const result = await pool.query('SELECT 1 FROM exercicio WHERE id = $1;', [id]);
        return result.rows.length > 0;
    }

    /**
     * Lista exercícios de uma turma específica (através das listas)
     */
    async listarExerciciosPorTurma(id_turma) {
        const result = await pool.query(`
            SELECT DISTINCT e.id, e.titulo, e.dificuldade 
            FROM exercicio e
            INNER JOIN lista_exercicio le ON e.id = le.id_exercicio
            INNER JOIN lista l ON le.id_lista = l.id
            WHERE l.id_turma = $1
            ORDER BY e.id ASC;
        `, [id_turma]);
        return result.rows;
    }
}

module.exports = new ExercicioService();
