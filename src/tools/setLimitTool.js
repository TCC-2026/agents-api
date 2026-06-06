import FinanceRepository from '../repositories/FinanceRepository.js';

export const declaration = {
    name: 'add_spending_limit',
    description: 'Cria um novo limite máximo de gastos para uma categoria em um determinado mês.',
    parameters: {
        type: 'OBJECT',
        properties: {
            category: {
                type: 'STRING',
                description: 'A categoria do limite (ex: Educação, Alimentação, Lazer). Deve coincidir com as categorias de despesas.'
            },
            limitMax: {
                type: 'NUMBER',
                description: 'O valor máximo que o usuário deseja gastar nesta categoria (ex: 3000).'
            },
            period: {
                type: 'STRING',
                description: 'O período do limite no formato YYYY-MM (ex: 2026-05). Se o usuário disser "neste mês", calcule o YYYY-MM atual.'
            }
        },
        required: ['category', 'limitMax', 'period']
    }
};

export const execute = async (args, session) => {
    try {
        const resultId = await FinanceRepository.setSpendingLimit(session, args);
        return {
            status: 'sucesso',
            id: resultId,
            mensagem: `Limite de R$ ${args.limitMax} para a categoria ${args.category} no período ${args.period} definido com sucesso.`
        };
    } catch (error) {
        return { status: 'erro', mensagem: error.message };
    }
};