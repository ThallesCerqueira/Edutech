// backend/services/turmaService.js
const pool = require('../db');

/**
 * Gerar código de convite único
 */
const gerarCodigoConvite = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 8; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
};

/**
 * Criar uma nova turma
 */
const criarTurma = async (nome, id_professor) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        let codigoConvite;
        let codigoExiste = true;

        // Gerar código único
        while (codigoExiste) {
            codigoConvite = gerarCodigoConvite();
            const verificacao = await client.query(
                'SELECT id FROM turma WHERE codigo_convite = $1',
                [codigoConvite]
            );
            codigoExiste = verificacao.rows.length > 0;
        }

        const query = 'INSERT INTO turma (nome, codigo_convite) VALUES ($1, $2) RETURNING id;';
        const result = await client.query(query, [nome, codigoConvite]);
        const turmaId = result.rows[0].id;

        // Adicionar o professor à turma automaticamente
        if (id_professor) {
            await client.query(
                'INSERT INTO professor_turma (id_usuario, id_turma) VALUES ($1, $2)',
                [id_professor, turmaId]
            );
        }

        await client.query('COMMIT');
        return { id: turmaId, codigo_convite: codigoConvite };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Listar todas as turmas
 */
const listarTurmas = async () => {
    const query = `
        SELECT t.id, t.nome, t.codigo_convite,
               COUNT(DISTINCT at.id_usuario) as total_alunos,
               COUNT(DISTINCT pt.id_usuario) as total_professores
        FROM turma t
        LEFT JOIN aluno_turma at ON t.id = at.id_turma
        LEFT JOIN professor_turma pt ON t.id = pt.id_turma
        GROUP BY t.id, t.nome
        ORDER BY t.nome ASC;
    `;
    const result = await pool.query(query);
    return result.rows;
};

/**
 * Buscar uma turma por ID
 */
const buscarTurmaPorId = async (id) => {
    const query = `
        SELECT t.id, t.nome, 
               COUNT(DISTINCT at.id_usuario) as total_alunos,
               COUNT(DISTINCT pt.id_usuario) as total_professores
        FROM turma t
        LEFT JOIN aluno_turma at ON t.id = at.id_turma
        LEFT JOIN professor_turma pt ON t.id = pt.id_turma
        WHERE t.id = $1
        GROUP BY t.id, t.nome;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

/**
 * Atualizar uma turma
 */
const atualizarTurma = async (id, nome) => {
    const query = 'UPDATE turma SET nome = $1 WHERE id = $2 RETURNING id, nome;';
    const result = await pool.query(query, [nome, id]);
    return result.rows[0] || null;
};

/**
 * Deletar uma turma
 */
const deletarTurma = async (id) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Remover todas as associações primeiro
        await client.query('DELETE FROM aluno_turma WHERE id_turma = $1;', [id]);
        await client.query('DELETE FROM professor_turma WHERE id_turma = $1;', [id]);

        // Atualizar listas que referenciam esta turma
        await client.query('UPDATE lista SET id_turma = NULL WHERE id_turma = $1;', [id]);

        // Deletar a turma
        const result = await client.query('DELETE FROM turma WHERE id = $1;', [id]);

        await client.query('COMMIT');
        return result.rowCount > 0;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Adicionar aluno a uma turma
 */
const adicionarAluno = async (id_turma, id_usuario) => {
    try {
        // Verificar se o usuário é realmente um aluno
        const verificaUsuario = await pool.query(
            'SELECT tipo FROM usuario WHERE id = $1 AND tipo = $2;',
            [id_usuario, 'aluno']
        );

        if (verificaUsuario.rows.length === 0) {
            return false;
        }

        // Verificar se já existe a associação
        const verificaAssociacao = await pool.query(
            'SELECT id FROM aluno_turma WHERE id_turma = $1 AND id_usuario = $2;',
            [id_turma, id_usuario]
        );

        if (verificaAssociacao.rows.length > 0) {
            return false; // Já existe
        }

        const query = 'INSERT INTO aluno_turma (id_turma, id_usuario) VALUES ($1, $2);';
        await pool.query(query, [id_turma, id_usuario]);
        return true;
    } catch (error) {
        console.error('Erro ao adicionar aluno:', error);
        return false;
    }
};

/**
 * Remover aluno de uma turma
 */
const removerAluno = async (id_turma, id_usuario) => {
    const query = 'DELETE FROM aluno_turma WHERE id_turma = $1 AND id_usuario = $2;';
    const result = await pool.query(query, [id_turma, id_usuario]);
    return result.rowCount > 0;
};

/**
 * Adicionar professor a uma turma
 */
const adicionarProfessor = async (id_turma, id_usuario) => {
    try {
        // Verificar se o usuário é realmente um professor
        const verificaUsuario = await pool.query(
            'SELECT tipo FROM usuario WHERE id = $1 AND tipo = $2;',
            [id_usuario, 'professor']
        );

        if (verificaUsuario.rows.length === 0) {
            return false;
        }

        // Verificar se já existe a associação
        const verificaAssociacao = await pool.query(
            'SELECT id FROM professor_turma WHERE id_turma = $1 AND id_usuario = $2;',
            [id_turma, id_usuario]
        );

        if (verificaAssociacao.rows.length > 0) {
            return false; // Já existe
        }

        const query = 'INSERT INTO professor_turma (id_turma, id_usuario) VALUES ($1, $2);';
        await pool.query(query, [id_turma, id_usuario]);
        return true;
    } catch (error) {
        console.error('Erro ao adicionar professor:', error);
        return false;
    }
};

/**
 * Remover professor de uma turma
 */
const removerProfessor = async (id_turma, id_usuario) => {
    const query = 'DELETE FROM professor_turma WHERE id_turma = $1 AND id_usuario = $2;';
    const result = await pool.query(query, [id_turma, id_usuario]);
    return result.rowCount > 0;
};

/**
 * Listar alunos de uma turma
 */
const listarAlunosTurma = async (id_turma) => {
    const query = `
        SELECT u.id, u.nome, u.email
        FROM usuario u
        INNER JOIN aluno_turma at ON u.id = at.id_usuario
        WHERE at.id_turma = $1
        ORDER BY u.nome ASC;
    `;
    const result = await pool.query(query, [id_turma]);
    return result.rows;
};

/**
 * Listar professores de uma turma
 */
const listarProfessoresTurma = async (id_turma) => {
    const query = `
        SELECT u.id, u.nome, u.email
        FROM usuario u
        INNER JOIN professor_turma pt ON u.id = pt.id_usuario
        WHERE pt.id_turma = $1
        ORDER BY u.nome ASC;
    `;
    const result = await pool.query(query, [id_turma]);
    return result.rows;
};

/**
 * Buscar turmas por usuário
 */
const buscarTurmasPorUsuario = async (id_usuario, tipo_usuario) => {
    let query = `
        SELECT DISTINCT t.id, t.nome, t.codigo_convite,
               COUNT(DISTINCT at.id_usuario) as total_alunos,
               COUNT(DISTINCT pt.id_usuario) as total_professores
        FROM turma t
    `;

    const params = [id_usuario];

    if (tipo_usuario === 'professor') {
        query += `
        INNER JOIN professor_turma pt_user ON t.id = pt_user.id_turma
        LEFT JOIN aluno_turma at ON t.id = at.id_turma
        LEFT JOIN professor_turma pt ON t.id = pt.id_turma
        WHERE pt_user.id_usuario = $1
        `;
    } else if (tipo_usuario === 'aluno') {
        query += `
        INNER JOIN aluno_turma at_user ON t.id = at_user.id_turma
        LEFT JOIN aluno_turma at ON t.id = at.id_turma
        LEFT JOIN professor_turma pt ON t.id = pt.id_turma
        WHERE at_user.id_usuario = $1
        `;
    } else {
        // Admin pode ver todas as turmas
        query += `
        LEFT JOIN aluno_turma at ON t.id = at.id_turma
        LEFT JOIN professor_turma pt ON t.id = pt.id_turma
        WHERE 1=1
        `;
    }

    query += `
    GROUP BY t.id, t.nome, t.codigo_convite
    ORDER BY t.nome ASC;
    `;

    const result = await pool.query(query, params);
    return result.rows;
};

/**
 * Entrar na turma por código de convite
 */
const entrarNaTurmaPorCodigo = async (codigo_convite, id_usuario, tipo_usuario) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Verificar se a turma existe
        const turmaQuery = 'SELECT id FROM turma WHERE codigo_convite = $1';
        const turmaResult = await client.query(turmaQuery, [codigo_convite]);

        if (turmaResult.rows.length === 0) {
            return { sucesso: false, mensagem: 'Código de convite inválido.' };
        }

        const id_turma = turmaResult.rows[0].id;

        // Verificar se o usuário já está na turma
        let verificacaoQuery;
        if (tipo_usuario === 'aluno') {
            verificacaoQuery = 'SELECT id FROM aluno_turma WHERE id_turma = $1 AND id_usuario = $2';
        } else if (tipo_usuario === 'professor') {
            verificacaoQuery = 'SELECT id FROM professor_turma WHERE id_turma = $1 AND id_usuario = $2';
        } else {
            return { sucesso: false, mensagem: 'Apenas alunos e professores podem entrar em turmas.' };
        }

        const verificacaoResult = await client.query(verificacaoQuery, [id_turma, id_usuario]);
        if (verificacaoResult.rows.length > 0) {
            return { sucesso: false, mensagem: 'Você já está nesta turma.' };
        }

        // Adicionar usuário à turma
        let insertQuery;
        if (tipo_usuario === 'aluno') {
            insertQuery = 'INSERT INTO aluno_turma (id_turma, id_usuario) VALUES ($1, $2)';
        } else {
            insertQuery = 'INSERT INTO professor_turma (id_turma, id_usuario) VALUES ($1, $2)';
        }

        await client.query(insertQuery, [id_turma, id_usuario]);
        await client.query('COMMIT');

        return { sucesso: true, mensagem: 'Entrada na turma realizada com sucesso!', id_turma };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao entrar na turma:', error);
        return { sucesso: false, mensagem: 'Erro interno do servidor.' };
    } finally {
        client.release();
    }
};

module.exports = {
    criarTurma,
    listarTurmas,
    buscarTurmaPorId,
    atualizarTurma,
    deletarTurma,
    adicionarAluno,
    removerAluno,
    adicionarProfessor,
    removerProfessor,
    listarAlunosTurma,
    listarProfessoresTurma,
    buscarTurmasPorUsuario,
    entrarNaTurmaPorCodigo
};
