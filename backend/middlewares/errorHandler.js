// backend/middlewares/errorHandler.js

/**
 * Middleware para tratamento centralizado de erros
 */
const errorHandler = (error, req, res, next) => {
    console.error('Erro capturado:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        params: req.params
    });

    // Erro de validação do banco de dados
    if (error.code === '23505') { // Violação de constraint única
        return res.status(409).json({
            mensagem: 'Conflito: dados já existem no sistema.',
            erro: 'DUPLICATE_ENTRY'
        });
    }

    // Erro de constraint de chave estrangeira
    if (error.code === '23503') {
        return res.status(400).json({
            mensagem: 'Erro de referência: dados relacionados não encontrados.',
            erro: 'FOREIGN_KEY_VIOLATION'
        });
    }

    // Erro de conexão com banco de dados
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return res.status(503).json({
            mensagem: 'Serviço temporariamente indisponível. Tente novamente.',
            erro: 'DATABASE_CONNECTION_ERROR'
        });
    }

    // Erro padrão
    return res.status(500).json({
        mensagem: 'Erro interno do servidor.',
        erro: 'INTERNAL_SERVER_ERROR'
    });
};

/**
 * Wrapper para async/await que captura erros automaticamente
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    errorHandler,
    asyncHandler
};
