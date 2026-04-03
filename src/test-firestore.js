import FinanceRepository from './repositories/FinanceRepository.js';

async function test() {
    console.log('🚀 Iniciando teste de inserção no Firestore...');

    // Usando o ID exato que vimos na sua imagem do Firestore
    const userId = 'g0lRlryXEFXaGDaPG38llqyOOrp1';

    try {
        console.log('⏳ Testando inserção de Despesa...');
        const despesaId = await FinanceRepository.addExpense(userId, {
            description: 'Lanche da tarde (Teste via Node.js)',
            value: 25.5,
            category: 'Alimentação'
        });
        console.log('✅ Despesa criada com sucesso! ID do doc:', despesaId);

        console.log('\n⏳ Testando inserção de Receita...');
        const receitaId = await FinanceRepository.addIncome(userId, {
            description: 'Pix do amigo (Teste via Node.js)',
            value: 150.0,
            category: 'Transferência'
        });
        console.log('✅ Receita criada com sucesso! ID do doc:', receitaId);

        console.log('\n🎉 Teste concluído! Olhe o painel do Firebase para confirmar.');
    } catch (err) {
        console.error('❌ Falha no teste:', err);
    }
}

test();
