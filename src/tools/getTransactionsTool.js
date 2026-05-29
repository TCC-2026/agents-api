import FinanceRepository from '../repositories/FinanceRepository.js';

export const declaration = {
    name: 'get_transactions',
    description: 'Consulta o histórico de transações do usuário. Retorna os dados detalhados, incluindo o ID de cada transação (necessário caso o usuário queira alterar algo depois).',
    parameters: {
        type: 'OBJECT',
        properties: {
            startDate: {
                type: 'STRING',
                description: 'Data de início da busca (ISO 8601). Ex: 2026-05-01T00:00:00.000Z'
            },
            endDate: {
                type: 'STRING',
                description: 'Data final da busca (ISO 8601). Ex: 2026-05-31T23:59:59.999Z'
            },
            type: {
                type: 'STRING',
                description: 'Filtra por tipo. Use "income" (receitas) ou "expense" (despesas). Se vazio, traz todas as transações.'
            }
        }
    }
};

export const execute = async (args, session) => {
    try {
        const transacoes = await FinanceRepository.getTransactions(session, args);
        
        if (transacoes.length === 0) {
            return { 
                status: 'sucesso', 
                mensagem: 'Nenhuma transação encontrada para os filtros informados.' 
            };
        }

        return {
            status: 'sucesso',
            quantidade: transacoes.length,
            dados: transacoes 
        };
    } catch (error) {
        return { status: 'erro', mensagem: error.message };
    }
};