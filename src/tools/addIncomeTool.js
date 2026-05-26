import FinanceRepository from '../repositories/FinanceRepository.js';

export const declaration = {
    name: 'add_income',
    description: 'Salva uma nova receita informada pelo usuário no banco de dados.',
    parameters: {
        type: 'OBJECT',
        properties: {
            value: {
                type: 'NUMBER',
                description: 'O valor da receita numérico (ex: 10.50)'
            },
            category: {
                type: 'STRING',
                description:
                    'A categoria da receita (ex: Salário, Extras, Benefícios, Rendimentos, Vendas, Estorno, Outros)'
            },
            description: {
                type: 'STRING',
                description: 'descrição completa da receita'
            },
            title: {
                type: 'STRING',
                description: 'Um título breve da transação em no máximo 3 palavras'
            },
            date: {
                type: 'STRING',
                description: 'Data da transação no formato ISO 8601 eg: 2026-05-24T12:00:00.000Z'
            }
        },
        required: ['value', 'category', 'date']
    }
};

export const execute = async (args, session) => {
    try {
        const docId = await FinanceRepository.addIncome(session, args);
        return {
            status: 'sucesso',
            id: docId,
            mensagem: `Receita de R$ ${args.value} em ${args.category} salva com sucesso.`
        };
    } catch (error) {
        return { status: 'erro', mensagem: error.message };
    }
};
