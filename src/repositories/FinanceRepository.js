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
        
        // 1. Acessa o documento do usuário para pegar o saldo inicial
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        const userData = userDoc.data() || {};
        
        const initialBalance = Number(userData.initialBalance) || 0;

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

        // 3. O saldo final  considera o dinheiro que ele já tinha
        const saldoFinal = initialBalance + totalIncome - totalExpense;

        LOGGER('info', `Saldo calculado para o user ${userId}: R$ ${saldoFinal} (Inicial: ${initialBalance})`);

        return {
            saldo_inicial: parseFloat(initialBalance.toFixed(2)),
            total_receitas: parseFloat(totalIncome.toFixed(2)),
            total_despesas: parseFloat(totalExpense.toFixed(2)),
            saldo_atual: parseFloat(saldoFinal.toFixed(2))
        };
    } catch (error) {
        LOGGER('error', 'Erro ao calcular saldo no Firestore:', error);
        throw error;
    }
};

// Cria ou atualiza um limite
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
            // INSERÇÃO: Não existe limite para essa categoria neste mês
            const payload = {
                tipo: data.category,
                periodo: data.period,
                limitemax: Number(data.limitMax)
            };
            const docRef = await limitesRef.add(payload);
            LOGGER('info', `Novo limite de ${data.category} inserido para o user ${userId}`);
            return docRef.id;
        } else {
            // ATUALIZAÇÃO: Já existe, então atualiza o valor
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

// Consulta os limites de um mês
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

export default { getUserIdByPhone, setTransaction, getUserById, getTransactions, getBalance, setSpendingLimit, getSpendingLimits };
