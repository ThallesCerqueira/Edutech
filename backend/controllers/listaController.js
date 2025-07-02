// backend/controllers/listaController.js
const listaService = require('../services/listaService');

/**
 * Criar uma nova lista de exercícios
 */
const criarLista = async (req, res) => {
    try {
        const { titulo, descricao, exercicios } = req.body;

        if (!titulo || !descricao || !exercicios || exercicios.length === 0) {
            return res.status(400).json({ mensagem: 'Título, descrição e exercícios são obrigatórios.' });
        }

        const novaListaId = await listaService.criarLista(titulo, descricao, exercicios);
        res.status(201).json({ mensagem: 'Lista de exercícios criada com sucesso.', id: novaListaId });
    } catch (error) {
        console.error('Erro no controller ao criar lista:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Listar todas as listas de exercícios
 */
const listarListas = async (req, res) => {
    try {
        const listas = await listaService.listarListas();
        res.status(200).json(listas);
    } catch (error) {
        console.error('Erro no controller ao listar listas:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Buscar uma lista específica por ID
 */
const buscarListaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const lista = await listaService.buscarListaPorId(id);

        if (!lista) {
            return res.status(404).json({ mensagem: 'Lista de exercícios não encontrada.' });
        }

        res.status(200).json(lista);
    } catch (error) {
        console.error('Erro no controller ao buscar lista:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Atualizar uma lista existente
 */
const atualizarLista = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descricao, exercicios } = req.body;

        if (!titulo || !descricao || !exercicios || exercicios.length === 0) {
            return res.status(400).json({ mensagem: 'Título, descrição e exercícios são obrigatórios.' });
        }

        await listaService.atualizarLista(id, titulo, descricao, exercicios);
        res.status(200).json({ mensagem: 'Lista de exercícios atualizada com sucesso.' });
    } catch (error) {
        console.error('Erro no controller ao atualizar lista:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Deletar uma lista
 */
const deletarLista = async (req, res) => {
    try {
        const { id } = req.params;
        const deletada = await listaService.deletarLista(id);

        if (!deletada) {
            return res.status(404).json({ mensagem: 'Lista de exercícios não encontrada para exclusão.' });
        }

        res.status(200).json({ mensagem: 'Lista de exercícios deletada com sucesso.' });
    } catch (error) {
        console.error('Erro no controller ao deletar lista:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

module.exports = {
    criarLista,
    listarListas,
    buscarListaPorId,
    atualizarLista,
    deletarLista
};
