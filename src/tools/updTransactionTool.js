import FinanceRepository from '../repositories/FinanceRepository.js';

export const declaration = {
    name: 'update_transaction',
    description: 'Atualiza os dados de uma transação existente no banco de dados. Use esta ferramenta APENAS quando o usuário solicitar explicitamente a alteração, correção ou exclusão/ajuste de um registro passado.',
    parameters: {
        type: 'OBJECT',
        properties: {
            id: {
                type: 'STRING',
                description: 'Obrigatório. O ID do documento da transação no Firestore (recuperado previamente via get_transactions).'
            },
            type: {
                type: 'STRING',
                description: 'O novo tipo da transação se necessário ("income" ou "expense").'
            },
            value: {
                type: 'NUMBER',
                description: 'O novo valor numérico corrigido.'
            },
            category: {
                type: 'STRING',
                description: 'A nova categoria corrigida.'
            },
            description: {
                type: 'STRING',
                description: 'A nova descrição corrigida.'
            },
            title: {
                type: 'STRING',
                description: 'O novo título corrigido.'
            },
            date: {
                type: 'STRING',
                description: 'A nova data corrigida no formato ISO 8601.'
            }
        },
        required: ['id']
    }
};

export const execute = async (args, session) => {
    try {
        const resultId = await FinanceRepository.setTransaction(session, args);
        return {
            status: 'sucesso',
            id: resultId,
            mensagem: 'Transação atualizada com sucesso no banco de dados.'
        };
    } catch (error) {
        return { status: 'erro', mensagem: error.message };
    }
};