// backend/controllers/mapaController.js
const mapaService = require('../services/mapaService');

/**
 * Controller para criar um novo mapa
 */
const criarMapa = async (req, res) => {
    try {
        const { titulo, dica, descricao, caminho } = req.body;

        // Validação básica
        if (!titulo) {
            return res.status(400).json({
                mensagem: 'Título é obrigatório.'
            });
        }

        const novoMapaId = await mapaService.criarMapa({ titulo, dica, descricao, caminho });

        res.status(201).json({
            mensagem: 'Mapa criado com sucesso.',
            id: novoMapaId
        });
    } catch (error) {
        console.error('Erro no controller ao criar mapa:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Controller para listar todos os mapas
 */
const listarMapas = async (req, res) => {
    try {
        const mapas = await mapaService.listarMapas();
        res.status(200).json(mapas);
    } catch (error) {
        console.error('Erro no controller ao listar mapas:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Controller para buscar um mapa por ID
 */
const buscarMapaPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ mensagem: 'ID inválido.' });
        }

        const mapa = await mapaService.buscarMapaPorId(parseInt(id));

        if (!mapa) {
            return res.status(404).json({ mensagem: 'Mapa não encontrado.' });
        }

        res.status(200).json(mapa);
    } catch (error) {
        console.error('Erro no controller ao buscar mapa:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Controller para atualizar um mapa
 */
const atualizarMapa = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, dica, descricao, caminho } = req.body;

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ mensagem: 'ID inválido.' });
        }

        const mapaAtualizado = await mapaService.atualizarMapa(parseInt(id), {
            titulo, dica, descricao, caminho
        });

        if (!mapaAtualizado) {
            return res.status(404).json({ mensagem: 'Mapa não encontrado.' });
        }

        res.status(200).json({
            mensagem: 'Mapa atualizado com sucesso.',
            mapa: mapaAtualizado
        });
    } catch (error) {
        console.error('Erro no controller ao atualizar mapa:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

/**
 * Controller para deletar um mapa
 */
const deletarMapa = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ mensagem: 'ID inválido.' });
        }

        const deletado = await mapaService.deletarMapa(parseInt(id));

        if (!deletado) {
            return res.status(404).json({ mensagem: 'Mapa não encontrado.' });
        }

        res.status(200).json({ mensagem: 'Mapa deletado com sucesso.' });
    } catch (error) {
        console.error('Erro no controller ao deletar mapa:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

module.exports = {
    criarMapa,
    listarMapas,
    buscarMapaPorId,
    atualizarMapa,
    deletarMapa
};
