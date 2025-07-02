// backend/controllers/exercicioController.js
const exercicioService = require('../services/exercicioService');

class ExercicioController {
    /**
     * POST /exercicios
     * Cria um novo exercício
     */
    async criarExercicio(req, res) {
        const { titulo, enunciado, dificuldade, id_mapa, alternativas } = req.body;

        const exercicio = await exercicioService.criarExercicio({
            titulo: titulo.trim(),
            enunciado: enunciado.trim(),
            dificuldade,
            id_mapa,
            alternativas
        });

        res.status(201).json({
            mensagem: 'Exercício criado com sucesso.',
            exercicio
        });
    }

    /**
     * GET /exercicios
     * Lista todos os exercícios
     */
    async listarExercicios(req, res) {
        const exercicios = await exercicioService.listarExercicios();

        res.status(200).json(exercicios);
    }

    /**
     * GET /exercicios/:id
     * Busca um exercício específico por ID
     */
    async buscarExercicioPorId(req, res) {
        const { id } = req.params;

        const exercicio = await exercicioService.buscarExercicioPorId(id);

        if (!exercicio) {
            return res.status(404).json({
                mensagem: 'Exercício não encontrado.',
                erro: 'NOT_FOUND'
            });
        }

        res.status(200).json(exercicio);
    }

    /**
     * PUT /exercicios/:id
     * Atualiza um exercício existente
     */
    async atualizarExercicio(req, res) {
        const { id } = req.params;
        const { titulo, enunciado, dificuldade, id_mapa, alternativas } = req.body;

        const exercicioAtualizado = await exercicioService.atualizarExercicio(id, {
            titulo: titulo.trim(),
            enunciado: enunciado.trim(),
            dificuldade,
            id_mapa,
            alternativas
        });

        if (!exercicioAtualizado) {
            return res.status(404).json({
                mensagem: 'Exercício não encontrado para atualização.',
                erro: 'NOT_FOUND'
            });
        }

        res.status(200).json({
            mensagem: 'Exercício atualizado com sucesso.',
            exercicio: exercicioAtualizado
        });
    }

    /**
     * DELETE /exercicios/:id
     * Deleta um exercício por ID
     */
    async deletarExercicio(req, res) {
        const { id } = req.params;

        const foiDeletado = await exercicioService.deletarExercicio(id);

        if (!foiDeletado) {
            return res.status(404).json({
                mensagem: 'Exercício não encontrado para exclusão.',
                erro: 'NOT_FOUND'
            });
        }

        res.status(200).json({
            mensagem: 'Exercício deletado com sucesso.'
        });
    }
}

module.exports = new ExercicioController();
