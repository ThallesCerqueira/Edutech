// backend/services/usuarioService.js
const pool = require('../db');
const bcrypt = require('bcrypt');

/**
 * Service para criar um novo usuário
 */
const criarUsuario = async (dadosUsuario) => {
    const { nome, email, senha, tipo = 'aluno' } = dadosUsuario;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Hash da senha
        const senhaHash = await bcrypt.hash(senha, 10);

        const query = `
      INSERT INTO usuario (nome, email, senha, tipo) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id;
    `;
        const values = [nome, email, senhaHash, tipo];
        const result = await client.query(query, values);

        const novoUsuarioId = result.rows[0].id;

        await client.query('COMMIT');
        return novoUsuarioId;
    } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`Erro ao criar usuário: ${error.message}`);
    } finally {
        client.release();
    }
};

/**
 * Service para buscar usuário por email
 */
const buscarUsuarioPorEmail = async (email) => {
    const client = await pool.connect();
    try {
        const query = 'SELECT * FROM usuario WHERE email = $1;';
        const result = await client.query(query, [email]);

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    } catch (error) {
        throw new Error(`Erro ao buscar usuário por email: ${error.message}`);
    } finally {
        client.release();
    }
};

/**
 * Service para buscar usuário por ID
 */
const buscarUsuarioPorId = async (id) => {
    const client = await pool.connect();
    try {
        const query = 'SELECT id, nome, email, tipo, criado_em FROM usuario WHERE id = $1;';
        const result = await client.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    } catch (error) {
        throw new Error(`Erro ao buscar usuário: ${error.message}`);
    } finally {
        client.release();
    }
};

/**
 * Service para autenticar usuário
 */
const autenticarUsuario = async (email, senha) => {
    const client = await pool.connect();
    try {
        const query = 'SELECT * FROM usuario WHERE email = $1;';
        const result = await client.query(query, [email]);

        if (result.rows.length === 0) {
            return null;
        }

        const usuario = result.rows[0];

        // Verificar senha
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return null;
        }

        // Retornar dados do usuário sem a senha
        return {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            tipo: usuario.tipo,
            criado_em: usuario.criado_em
        };
    } catch (error) {
        throw new Error(`Erro ao autenticar usuário: ${error.message}`);
    } finally {
        client.release();
    }
};

/**
 * Service para listar todos os usuários
 */
const listarUsuarios = async () => {
    const client = await pool.connect();
    try {
        const query = `
      SELECT id, nome, email, tipo, criado_em 
      FROM usuario 
      ORDER BY criado_em DESC;
    `;
        const result = await client.query(query);
        return result.rows;
    } catch (error) {
        throw new Error(`Erro ao listar usuários: ${error.message}`);
    } finally {
        client.release();
    }
};

/**
 * Service para atualizar um usuário
 */
const atualizarUsuario = async (id, dadosAtualizacao) => {
    const { nome, email, senha } = dadosAtualizacao;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Verifica se o usuário existe primeiro
        const queryVerificar = 'SELECT id, nome, email, tipo, criado_em FROM usuario WHERE id = $1;';
        const resultVerificar = await client.query(queryVerificar, [id]);

        if (resultVerificar.rows.length === 0) {
            return null;
        }

        const usuarioExistente = resultVerificar.rows[0];

        // Prepara os campos para atualização
        const camposAtualizar = [];
        const valores = [];
        let contador = 1;

        if (nome !== undefined) {
            camposAtualizar.push(`nome = $${contador}`);
            valores.push(nome);
            contador++;
        }

        if (email !== undefined) {
            camposAtualizar.push(`email = $${contador}`);
            valores.push(email);
            contador++;
        }

        if (senha !== undefined) {
            const senhaHash = await bcrypt.hash(senha, 10);
            camposAtualizar.push(`senha = $${contador}`);
            valores.push(senhaHash);
            contador++;
        }

        if (camposAtualizar.length === 0) {
            return usuarioExistente; // Nenhuma atualização necessária
        }

        valores.push(id);
        const query = `
      UPDATE usuario 
      SET ${camposAtualizar.join(', ')} 
      WHERE id = $${contador} 
      RETURNING id, nome, email, tipo, criado_em;
    `;

        const result = await client.query(query, valores);

        await client.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    } finally {
        client.release();
    }
};

/**
 * Service para deletar um usuário
 */
const deletarUsuario = async (id) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Verifica se o usuário existe primeiro
        const queryVerificar = 'SELECT id FROM usuario WHERE id = $1;';
        const resultVerificar = await client.query(queryVerificar, [id]);

        if (resultVerificar.rows.length === 0) {
            return false;
        }

        // Deleta o usuário
        const query = 'DELETE FROM usuario WHERE id = $1;';
        await client.query(query, [id]);

        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`Erro ao deletar usuário: ${error.message}`);
    } finally {
        client.release();
    }
};

module.exports = {
    criarUsuario,
    buscarUsuarioPorEmail,
    buscarUsuarioPorId,
    autenticarUsuario,
    listarUsuarios,
    atualizarUsuario,
    deletarUsuario
};
