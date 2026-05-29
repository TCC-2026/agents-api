import FinanceRepository from '../repositories/FinanceRepository.js';

export const declaration = {
    name: 'get_balance',
    description: 'Consulta o resumo financeiro do usuário. Retorna o total de receitas, total de despesas e o saldo final (receitas - despesas).',
    // parameters: {
    //     type: 'OBJECT',
    //     properties: {
    //         startDate: {
    //             type: 'STRING',
    //             description: 'Data de início opcional para filtrar o saldo (ISO 8601).'
    //         },
    //         endDate: {
    //             type: 'STRING',
    //             description: 'Data final opcional para filtrar o saldo (ISO 8601).'
    //         }
    //     }
    // }
};

export const execute = async (args, session) => {
    try {
        const resumo = await FinanceRepository.getBalance(session, args);
        return {
            status: 'sucesso',
            dados: resumo // A IA vai ler esses totais e formular a resposta
        };
    } catch (error) {
        return { status: 'erro', mensagem: error.message };
    }
};