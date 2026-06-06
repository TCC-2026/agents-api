import FinanceRepository from '../repositories/FinanceRepository.js';

export const declaration = {
    name: 'get_spending_limits',
    description: 'Consulta todos os limites de gastos estipulados pelo usuário para um determinado mês.',
    parameters: {
        type: 'OBJECT',
        properties: {
            period: {
                type: 'STRING',
                description: 'O período da busca no formato YYYY-MM (ex: 2026-05). Se não for especificado, use o mês atual.'
            }
        },
        required: ['period']
    }
};

export const execute = async (args, session) => {
    try {
        const limites = await FinanceRepository.getSpendingLimits(session, args.period);
        
        if (limites.length === 0) {
            return { 
                status: 'sucesso', 
                mensagem: `Nenhum limite configurado para o período ${args.period}.` 
            };
        }

        return {
            status: 'sucesso',
            quantidade: limites.length,
            dados: limites 
        };
    } catch (error) {
        return { status: 'erro', mensagem: error.message };
    }
};