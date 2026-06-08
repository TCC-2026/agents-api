import db from '../config/firebase.js';
import ChatRepository from '../repositories/ChatRepository.js';
import LOGGER from '../utils/logger.js';

const getUserById = async (userId) => {
    try {
        const usersRef = db.collection('users');
        const user = await usersRef.doc(userId).get();

        if (!user.exists) return null;
        return user.id;
    } catch (error) {
        LOGGER('error', 'Erro ao buscar UID pelo telefone no Firestore:', error);
        throw error;
    }
};

const getUserIdByPhone = async (phone) => {
    try {
        // phone format expected (+5519123450000)
        const usersRef = db.collection('users');
        const user = await usersRef.where('phone', '==', phone).get();
        LOGGER('info', `Busca do usuário ${phone} retornou ${user.size} resultados do Firestore.`);

        if (user.empty) return null;
        return user.docs[0].id;
    } catch (error) {
        LOGGER('error', 'Erro ao buscar UID pelo telefone no Firestore:', error);
        throw error;
    }
};

// Receitas e Despesas
const setTransaction = async (session, data) => {
    try {
        const userId = await getVerifiedUserId(session);
        const transacoesRef = db.collection('users').doc(userId).collection('transacoes');

        if (data.transaction_id) { 
            const updatePayload = {};
            
            if (data.type) updatePayload.type = data.type;
            if (data.value !== undefined) updatePayload.value = Number(data.value);
            if (data.category) updatePayload.category = data.category;
            if (data.date) updatePayload.date = new Date(data.date).toISOString();
            if (data.description !== undefined) updatePayload.description = data.description;
            if (data.title !== undefined) updatePayload.title = data.title;

            await transacoesRef.doc(data.transaction_id).update(updatePayload);
            LOGGER('info', `Transação ${data.transaction_id} atualizada no Firestore para o user ${userId}`);
            return data.transaction_id;

        } else { 
            const insertPayload = {
                category: data.category || 'Outros',
                date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
                description: data.description || '',
                title: data.title || '',
                type: data.type,
                value: Number(data.value)
            };
            
            const docRef = await transacoesRef.add(insertPayload);
            LOGGER('info', `Nova transação (${data.type}) inserida no Firestore para o user ${userId}`);
            return docRef.id;
        }
    } catch (error) {
        LOGGER('error', 'Erro ao processar transação no Firestore:', error);
        throw error;
    }
};

const getVerifiedUserId = async (session) => {
    try {
        let userId = await getUserById(session.firebaseUserId);

        if (!userId) {
            LOGGER('info', `Usuário com ID ${session.firebaseUserId} não encontrado no Firestore.`);
            userId = await getUserIdByPhone(session.phone);

            if (userId) {
                ChatRepository.updateSessionFirebaseUserId(session.id, userId);
            } else {
                const error = new Error(`Usuário ${session.phone} não encontrado no Firestore.`);
                error.code = 'FIRESTORE_USER_NOT_FOUND';
                throw error;
            }
        }
        return userId;
    } catch (error) {
        LOGGER('error', 'Erro ao verificar UID do usuário no Firestore:', error);
        throw error;
    }
};

const getTransactions = async (session, filters = {}) => {
    try {
        const userId = await getVerifiedUserId(session);
        const transacoesRef = db.collection('users').doc(userId).collection('transacoes');
        const snapshot = await transacoesRef.orderBy('date', 'desc').limit(100).get();

        let transacoes = [];
        snapshot.forEach(doc => {
            transacoes.push({ id: doc.id, ...doc.data() });
        });

        // Filtros de Data
        if (filters.startDate) {
            transacoes = transacoes.filter(t => t.date >= filters.startDate);
        }
        if (filters.endDate) {
            transacoes = transacoes.filter(t => t.date <= filters.endDate);
        }
        
        if (filters.type && filters.type !== 'all') {
            transacoes = transacoes.filter(t => t.type === filters.type);
        }
        
        LOGGER('info', `${transacoes.length} transações retornadas para o user ${userId}`);
        return transacoes;

    } catch (error) {
        LOGGER('error', 'Erro ao consultar transações no Firestore:', error);
        throw error;
    }
};

const getBalance = async (session, filters = {}) => {
    try {
        const userId = await getVerifiedUserId(session);
        
        // 1. Acessa o usuário
        const userRef = db.collection('users').doc(userId);

        // 2. Acessa as transações
        const transacoesRef = userRef.collection('transacoes');
        const snapshot = await transacoesRef.get();

        let totalIncome = 0;
        let totalExpense = 0;

        snapshot.forEach(doc => {
            const t = doc.data();
            const tDate = t.date;

            if (filters.startDate && tDate < filters.startDate) return;
            if (filters.endDate && tDate > filters.endDate) return;

            if (t.type === 'income') {
                totalIncome += Number(t.value) || 0;
            } else if (t.type === 'expense') {
                totalExpense += Number(t.value) || 0;
            }
        });

        // 3. O saldo final considera o dinheiro que ele já tinha (Saldo inicial está em Incomes)
        const saldoFinal = totalIncome - totalExpense;

        LOGGER('info', `Saldo calculado para o user ${userId}: R$ ${saldoFinal}`);

        return {
            total_receitas: parseFloat(totalIncome.toFixed(2)),
            total_despesas: parseFloat(totalExpense.toFixed(2)),
            saldo_atual: parseFloat(saldoFinal.toFixed(2))
        };
    } catch (error) {
        LOGGER('error', 'Erro ao calcular saldo no Firestore:', error);
        throw error;
    }
};

const setSpendingLimit = async (session, data) => {
    try {
        const userId = await getVerifiedUserId(session);
        const limitesRef = db.collection('users').doc(userId).collection('limites');

        // Busca se já existe um limite para este tipo neste período
        const snapshot = await limitesRef
            .where('tipo', '==', data.category)
            .where('periodo', '==', data.period)
            .get();

        if (snapshot.empty) {
            const payload = {
                tipo: data.category,
                periodo: data.period,
                limitemax: Number(data.limitMax)
            };
            const docRef = await limitesRef.add(payload);
            LOGGER('info', `Novo limite de ${data.category} inserido para o user ${userId}`);
            return docRef.id;
        } else {
            const docId = snapshot.docs[0].id;
            await limitesRef.doc(docId).update({
                limitemax: Number(data.limitMax)
            });
            LOGGER('info', `Limite de ${data.category} atualizado para o user ${userId}`);
            return docId;
        }
    } catch (error) {
        LOGGER('error', 'Erro ao configurar limite no Firestore:', error);
        throw error;
    }
};

const getSpendingLimits = async (session, period) => {
    try {
        const userId = await getVerifiedUserId(session);
        const limitesRef = db.collection('users').doc(userId).collection('limites');

        const snapshot = await limitesRef.where('periodo', '==', period).get();

        let limites = [];
        snapshot.forEach(doc => {
            limites.push({ id: doc.id, ...doc.data() });
        });

        LOGGER('info', `${limites.length} limites retornados para o user ${userId}`);
        return limites;
    } catch (error) {
        LOGGER('error', 'Erro ao consultar limites no Firestore:', error);
        throw error;
    }
};

const getUserContext = async (userId) => {
    try {
        // Dados Básicos do Usuário
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            return 'Usuário novo. Nenhum dado de perfil encontrado.';
        }
        
        const userData = userDoc.data();
        const nome = userData.name || 'Usuário';
        const initialBalance = Number(userData.initialBalance) || 0;

        // Mês Atual e Mês Anterior
        const now = new Date();
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // Transações
        const transacoesRef = userRef.collection('transacoes');
        const snapshot = await transacoesRef.get();

        let totalIncome = 0;
        let totalExpense = 0;
        const historicoRecente = [];

        snapshot.forEach(doc => {
            const t = doc.data();
            const tDate = new Date(t.date);

            // Soma para o saldo global
            if (t.type === 'income') totalIncome += Number(t.value) || 0;
            else if (t.type === 'expense') totalExpense += Number(t.value) || 0;

            // Filtra para o Contexto da IA ( mês passado e atual)
            if (tDate >= startOfLastMonth && tDate <= endOfCurrentMonth) {
                historicoRecente.push({
                    id: doc.id,
                    data: t.date.split('T')[0],
                    tipo: t.type,
                    categoria: t.category,
                    valor: t.value,
                    titulo: t.title
                });
            }
        });

        const saldoAtual = initialBalance + totalIncome - totalExpense;

        // Busca os Limites
        const limitesRef = userRef.collection('limites');
        const limitesSnapshot = await limitesRef.get();
        
        const limitesConfigurados = [];
        limitesSnapshot.forEach(doc => {
            limitesConfigurados.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Monta o Contexto em formato JSON
        const contextoObjeto = {
            perfil: {
                nome: nome,
                saldo_atual: Number(saldoAtual.toFixed(2))
            },
            limites_de_gastos: limitesConfigurados,
            extrato_mes_atual_e_anterior: historicoRecente
        };

        // Transforma o objeto em uma string formatada para a IA ler facilmente
        const contextoString = JSON.stringify(contextoObjeto, null, 2);

        LOGGER('info', `Contexto gerado para o usuário ${userId}`);
        return contextoString;

    } catch (error) {
        LOGGER('error', 'Erro ao buscar contexto do usuário:', error);
        return 'Contexto financeiro temporariamente indisponível.';
    }
};

export default { getUserIdByPhone, setTransaction, getUserById, getTransactions, getBalance, setSpendingLimit, getSpendingLimits, getUserContext };
