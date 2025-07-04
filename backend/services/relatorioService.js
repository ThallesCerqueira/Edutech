// backend/services/relatorioService.js
const pool = require('../db');

/**
 * Obter relatório geral do dashboard
 */
const obterDashboardGeral = async () => {
    const query = 'SELECT * FROM vw_dashboard_geral;';
    const result = await pool.query(query);
    return result.rows[0];
};

/**
 * Obter relatório de turmas
 */
const obterRelatorioTurmas = async () => {
    const query = 'SELECT * FROM vw_relatorio_turmas;';
    const result = await pool.query(query);
    return result.rows;
};

/**
 * Obter relatório de usuários
 */
const obterRelatorioUsuarios = async (tipo = null) => {
    let query = 'SELECT * FROM vw_relatorio_usuarios';
    const params = [];
    
    if (tipo) {
        query += ' WHERE tipo = $1';
        params.push(tipo);
    }
    
    query += ' ORDER BY tipo, nome;';
    
    const result = await pool.query(query, params);
    return result.rows;
};

/**
 * Obter relatório de listas
 */
const obterRelatorioListas = async (id_turma = null) => {
    let query = 'SELECT * FROM vw_relatorio_listas';
    const params = [];
    
    if (id_turma) {
        query += ' WHERE id_turma = $1';
        params.push(id_turma);
    }
    
    query += ' ORDER BY titulo;';
    
    const result = await pool.query(query, params);
    return result.rows;
};

/**
 * Obter relatório de exercícios
 */
const obterRelatorioExercicios = async (dificuldade = null) => {
    let query = 'SELECT * FROM vw_relatorio_exercicios';
    const params = [];
    
    if (dificuldade) {
        query += ' WHERE dificuldade = $1';
        params.push(dificuldade);
    }
    
    query += ' ORDER BY dificuldade, titulo;';
    
    const result = await pool.query(query, params);
    return result.rows;
};

/**
 * Obter relatório de mapas
 */
const obterRelatorioMapas = async () => {
    const query = 'SELECT * FROM vw_relatorio_mapas;';
    const result = await pool.query(query);
    return result.rows;
};

/**
 * Obter relatório de alunos por turma
 */
const obterRelatorioAlunosTurmas = async (id_turma = null) => {
    let query = 'SELECT * FROM vw_relatorio_alunos_turmas';
    const params = [];
    
    if (id_turma) {
        query += ' WHERE id_turma = $1';
        params.push(id_turma);
    }
    
    query += ' ORDER BY nome_turma, nome_aluno;';
    
    const result = await pool.query(query, params);
    return result.rows;
};

/**
 * Obter relatório de professores por turma
 */
const obterRelatorioProfessoresTurmas = async (id_turma = null) => {
    let query = 'SELECT * FROM vw_relatorio_professores_turmas';
    const params = [];
    
    if (id_turma) {
        query += ' WHERE id_turma = $1';
        params.push(id_turma);
    }
    
    query += ' ORDER BY nome_turma, nome_professor;';
    
    const result = await pool.query(query, params);
    return result.rows;
};

/**
 * Obter exercícios órfãos (não associados a nenhuma lista)
 */
const obterExerciciosOrfaos = async () => {
    const query = 'SELECT * FROM vw_exercicios_orfaos;';
    const result = await pool.query(query);
    return result.rows;
};

/**
 * Obter listas sem turma
 */
const obterListasSemTurma = async () => {
    const query = 'SELECT * FROM vw_listas_sem_turma;';
    const result = await pool.query(query);
    return result.rows;
};

/**
 * Obter estatísticas de uma turma específica
 */
const obterEstatisticasTurma = async (id_turma) => {
    const query = `
        SELECT 
            t.id,
            t.nome as nome_turma,
            COUNT(DISTINCT at.id_usuario) as total_alunos,
            COUNT(DISTINCT pt.id_usuario) as total_professores,
            COUNT(DISTINCT l.id) as total_listas,
            COUNT(DISTINCT le.id_exercicio) as total_exercicios,
            ROUND(AVG(e.dificuldade), 2) as dificuldade_media,
            COUNT(DISTINCT m.id) as mapas_utilizados
        FROM turma t
        LEFT JOIN aluno_turma at ON t.id = at.id_turma
        LEFT JOIN professor_turma pt ON t.id = pt.id_turma
        LEFT JOIN lista l ON t.id = l.id_turma
        LEFT JOIN lista_exercicio le ON l.id = le.id_lista
        LEFT JOIN exercicio e ON le.id_exercicio = e.id
        LEFT JOIN mapa m ON e.id_mapa = m.id
        WHERE t.id = $1
        GROUP BY t.id, t.nome;
    `;
    
    const result = await pool.query(query, [id_turma]);
    return result.rows[0];
};

/**
 * Obter relatório de distribuição de dificuldade dos exercícios
 */
const obterDistribuicaoDificuldade = async () => {
    const query = `
        SELECT 
            dificuldade,
            COUNT(*) as quantidade,
            ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM exercicio)), 2) as percentual
        FROM exercicio
        GROUP BY dificuldade
        ORDER BY dificuldade;
    `;
    
    const result = await pool.query(query);
    return result.rows;
};

/**
 * Obter top mapas mais utilizados
 */
const obterTopMapasUtilizados = async (limite = 10) => {
    const query = `
        SELECT 
            m.id,
            m.titulo,
            COUNT(DISTINCT e.id) as total_exercicios,
            COUNT(DISTINCT le.id_lista) as total_listas
        FROM mapa m
        LEFT JOIN exercicio e ON m.id = e.id_mapa
        LEFT JOIN lista_exercicio le ON e.id = le.id_exercicio
        GROUP BY m.id, m.titulo
        HAVING COUNT(DISTINCT e.id) > 0
        ORDER BY total_exercicios DESC, total_listas DESC
        LIMIT $1;
    `;
    
    const result = await pool.query(query, [limite]);
    return result.rows;
};

module.exports = {
    obterDashboardGeral,
    obterRelatorioTurmas,
    obterRelatorioUsuarios,
    obterRelatorioListas,
    obterRelatorioExercicios,
    obterRelatorioMapas,
    obterRelatorioAlunosTurmas,
    obterRelatorioProfessoresTurmas,
    obterExerciciosOrfaos,
    obterListasSemTurma,
    obterEstatisticasTurma,
    obterDistribuicaoDificuldade,
    obterTopMapasUtilizados
};
