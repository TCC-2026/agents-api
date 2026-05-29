import FinanceRepository from '../repositories/FinanceRepository.js';

export const declaration = {
    name: 'add_transaction',
    description: 'Registra um novo registro financeiro (despesa ou receita) no banco de dados.',
    parameters: {
        type: 'OBJECT',
        properties: {
            type: {
                type: 'STRING',
                description: 'Obrigatório. O tipo da transação. Use "income" para receitas/entradas e "expense" para despesas/saídas.'
            },
            value: {
                type: 'NUMBER',
                description: 'O valor numérico da transação (ex: 10.50)'
            },
            category: {
                type: 'STRING',
                description: 'A categoria (ex: Alimentação, Transporte, Salário, Extras, etc.)'
            },
            description: {
                type: 'STRING',
                description: 'Descrição completa e detalhada da transação'
            },
            title: {
                type: 'STRING',
                description: 'Um título breve em no máximo 3 palavras'
            },
            date: {
                type: 'STRING',
                description: 'Data no formato ISO 8601 eg: 2026-05-24T12:00:00.000Z'
            }
        },
        required: ['type', 'value', 'category', 'date']
    }
};

export const execute = async (args, session) => {
    try {
        const docId = await FinanceRepository.setTransaction(session, args);
        return {
            status: 'sucesso',
            transaction_id: docId,
            mensagem: `Transação de ${args.type} no valor de R$ ${args.value} em ${args.category} salva com sucesso.`
        };
    } catch (error) {
        return { status: 'erro', mensagem: error.message };
    }
};
