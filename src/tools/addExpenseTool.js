import FinanceRepository from '../repositories/FinanceRepository.js';

export const declaration = {
    name: 'add_expense',
    description: 'Salva uma nova despesa/gasto informado pelo usuário no banco de dados.',
    parameters: {
        type: 'OBJECT',
        properties: {
            value: {
                type: 'NUMBER',
                description: 'O valor da despesa numérico (ex: 10.50)'
            },
            category: {
                type: 'STRING',
                description: 'A categoria da despesa (ex: Alimentação, Transporte, Lazer)'
            },
            description: {
                type: 'STRING',
                description: 'Um breve resumo do que foi comprado'
            }
        },
        required: ['value', 'category']
    }
};

export const execute = async (args, firebaseUserId) => {
    try {
        const docId = await FinanceRepository.addExpense(firebaseUserId, args);
        return {
            status: 'sucesso',
            id: docId,
            mensagem: `Despesa de R$ ${args.value} em ${args.category} salva com sucesso.`
        };
    } catch (error) {
        return { status: 'erro', mensagem: error.message };
    }
};
