// backend/controllers/turmaController.js
const turmaService = require('../services/turmaService');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'edutech_secret_key_2024';

/**
 * Criar uma nova turma
 */
const criarTurma = async (req, res) => {
    try {
        const { nome } = req.body;
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!nome) {
            return res.status(400).json({ mensagem: 'Nome da turma é obrigatório.' });
        }

        if (!token) {
            return res.status(401).json({ mensagem: 'Token não fornecido.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const resultado = await turmaService.criarTurma(nome, decoded.id);

        res.status(201).json({
            mensagem: 'Turma criada com sucesso.',
            id: resultado.id,
            codigo_convite: resultado.codigo_convite
        });
    } catch (error) {
        console.error('Erro no controller ao criar turma:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Listar todas as turmas
 */
const listarTurmas = async (req, res) => {
    try {
        const turmas = await turmaService.listarTurmas();
        res.status(200).json(turmas);
    } catch (error) {
        console.error('Erro no controller ao listar turmas:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Buscar uma turma específica por ID
 */
const buscarTurmaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const turma = await turmaService.buscarTurmaPorId(id);

        if (!turma) {
            return res.status(404).json({ mensagem: 'Turma não encontrada.' });
        }

        res.status(200).json(turma);
    } catch (error) {
        console.error('Erro no controller ao buscar turma:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Atualizar uma turma
 */
const atualizarTurma = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome } = req.body;

        if (!nome) {
            return res.status(400).json({ mensagem: 'Nome da turma é obrigatório.' });
        }

        const turmaAtualizada = await turmaService.atualizarTurma(id, nome);

        if (!turmaAtualizada) {
            return res.status(404).json({ mensagem: 'Turma não encontrada para atualização.' });
        }

        res.status(200).json({ mensagem: 'Turma atualizada com sucesso.', turma: turmaAtualizada });
    } catch (error) {
        console.error('Erro no controller ao atualizar turma:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Deletar uma turma
 */
const deletarTurma = async (req, res) => {
    try {
        const { id } = req.params;
        const deletada = await turmaService.deletarTurma(id);

        if (!deletada) {
            return res.status(404).json({ mensagem: 'Turma não encontrada para exclusão.' });
        }

        res.status(200).json({ mensagem: 'Turma deletada com sucesso.' });
    } catch (error) {
        console.error('Erro no controller ao deletar turma:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Adicionar aluno a uma turma
 */
const adicionarAluno = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_usuario } = req.body;

        if (!id_usuario) {
            return res.status(400).json({ mensagem: 'ID do usuário é obrigatório.' });
        }

        const adicionado = await turmaService.adicionarAluno(id, id_usuario);

        if (!adicionado) {
            return res.status(400).json({ mensagem: 'Erro ao adicionar aluno à turma.' });
        }

        res.status(201).json({ mensagem: 'Aluno adicionado à turma com sucesso.' });
    } catch (error) {
        console.error('Erro no controller ao adicionar aluno:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Remover aluno de uma turma
 */
const removerAluno = async (req, res) => {
    try {
        const { id, id_usuario } = req.params;
        const removido = await turmaService.removerAluno(id, id_usuario);

        if (!removido) {
            return res.status(404).json({ mensagem: 'Aluno não encontrado na turma.' });
        }

        res.status(200).json({ mensagem: 'Aluno removido da turma com sucesso.' });
    } catch (error) {
        console.error('Erro no controller ao remover aluno:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Adicionar professor a uma turma
 */
const adicionarProfessor = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_usuario } = req.body;

        if (!id_usuario) {
            return res.status(400).json({ mensagem: 'ID do usuário é obrigatório.' });
        }

        const adicionado = await turmaService.adicionarProfessor(id, id_usuario);

        if (!adicionado) {
            return res.status(400).json({ mensagem: 'Erro ao adicionar professor à turma.' });
        }

        res.status(201).json({ mensagem: 'Professor adicionado à turma com sucesso.' });
    } catch (error) {
        console.error('Erro no controller ao adicionar professor:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Remover professor de uma turma
 */
const removerProfessor = async (req, res) => {
    try {
        const { id, id_usuario } = req.params;
        const removido = await turmaService.removerProfessor(id, id_usuario);

        if (!removido) {
            return res.status(404).json({ mensagem: 'Professor não encontrado na turma.' });
        }

        res.status(200).json({ mensagem: 'Professor removido da turma com sucesso.' });
    } catch (error) {
        console.error('Erro no controller ao remover professor:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Listar alunos de uma turma
 */
const listarAlunosTurma = async (req, res) => {
    try {
        const { id } = req.params;
        const alunos = await turmaService.listarAlunosTurma(id);
        res.status(200).json(alunos);
    } catch (error) {
        console.error('Erro no controller ao listar alunos:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Listar professores de uma turma
 */
const listarProfessoresTurma = async (req, res) => {
    try {
        const { id } = req.params;
        const professores = await turmaService.listarProfessoresTurma(id);
        res.status(200).json(professores);
    } catch (error) {
        console.error('Erro no controller ao listar professores:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Buscar turmas do usuário logado
 */
const buscarMinhasTurmas = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ mensagem: 'Token não fornecido.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const turmas = await turmaService.buscarTurmasPorUsuario(decoded.id, decoded.tipo);

        res.status(200).json(turmas);
    } catch (error) {
        console.error('Erro no controller ao buscar turmas do usuário:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Entrar na turma por código de convite
 */
const entrarNaTurma = async (req, res) => {
    try {
        const { codigo_convite } = req.body;
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!codigo_convite) {
            return res.status(400).json({ mensagem: 'Código de convite é obrigatório.' });
        }

        if (!token) {
            return res.status(401).json({ mensagem: 'Token não fornecido.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const resultado = await turmaService.entrarNaTurmaPorCodigo(codigo_convite, decoded.id, decoded.tipo);

        if (resultado.sucesso) {
            res.status(200).json(resultado);
        } else {
            res.status(400).json(resultado);
        }
    } catch (error) {
        console.error('Erro no controller ao entrar na turma:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
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
    buscarMinhasTurmas,
    entrarNaTurma
};
